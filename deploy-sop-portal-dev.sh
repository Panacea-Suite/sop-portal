#!/bin/bash
set -e
set -x

LOG_FILE="/home/ubuntu/logs/sop_portal_deployment.log"

function handle_error {
    echo "Error occurred during deployment. Last 50 lines:"
    tail -n 50 $LOG_FILE 2>/dev/null || echo "Could not read log file"
    exit 1
}

trap 'handle_error' ERR

start_time=$(date +"%Y-%m-%d %H:%M:%S")
{
    echo "--------------------------------------------------------------------------------"
    echo "SOP Portal Dev Deployment started at: $start_time"
    echo "--------------------------------------------------------------------------------"

    # Navigate to app directory
    echo "Navigating to app directory..."
    cd /home/ubuntu/sop-portal || exit 1

    # Download .env from AWS Secrets Manager
    echo "Downloading environment file from Secrets Manager..."
    /snap/bin/aws secretsmanager get-secret-value \
        --secret-id arn:aws:secretsmanager:eu-west-2:677276088716:secret:dev/sop-portal/env-DvRySp \
        --region eu-west-2 | jq -r '.SecretString' | jq -r "to_entries|map(\"\(.key)=\\\"\(.value|tostring)\\\"\")|.[]" > .env || exit 1
    echo ".env file updated successfully"

    # Get GitHub PAT from Secrets Manager
    echo "Fetching GitHub credentials..."
    GITHUB_PAT=$(/snap/bin/aws secretsmanager get-secret-value \
        --secret-id arn:aws:secretsmanager:eu-west-2:677276088716:secret:cicd/github-key/all-environment-853DH7 \
        --region eu-west-2 \
        --query SecretString \
        --output text | jq -r '.GITHUB_PAT')
    
    # Configure git to use PAT for this operation only
    echo "Configuring git credentials..."
    git config --local credential.helper "!f() { echo username=sirajsaleem; echo password=$GITHUB_PAT; }; f"

    # Git operations
    echo "Checking git status..."
    git status || exit 1
    
    echo "Resetting any local changes..."
    git reset --hard || exit 1
    
    echo "Pulling latest changes from dev branch..."
    git pull origin dev || exit 1
    
    # Clear git credentials
    git config --local --unset credential.helper

    # Install dependencies
    echo "Installing dependencies..."
    npm install || exit 1

    # Prisma
    echo "Generating Prisma client..."
    npx prisma generate || exit 1

    echo "Pushing database schema..."
    npx prisma db push || exit 1

    echo "Seeding database..."
    npm run db:seed || echo "Seeding skipped/failed"

    # Build
    echo "Building application..."
    npm run build || exit 1

    # Restart PM2
    echo "Restarting PM2 process..."
    if pm2 describe sop-portal-dev &> /dev/null; then
        pm2 restart sop-portal-dev || exit 1
    else
        pm2 start npm --name "sop-portal-dev" -- start || exit 1
    fi
    pm2 save || exit 1

    # Verify
    echo "Checking PM2 status..."
    pm2 list || exit 1

    end_time=$(date +"%Y-%m-%d %H:%M:%S")
    echo "--------------------------------------------------------------------------------"
    echo "SOP Portal Dev Deployment completed at: $end_time"
    echo "--------------------------------------------------------------------------------"

} | tee -a $LOG_FILE

exit_status=${PIPESTATUS[0]}
exit $exit_status