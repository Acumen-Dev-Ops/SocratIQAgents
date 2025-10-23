# CloudShell Setup - Copy/Paste Method

Since disk space is limited locally, here's how to set up everything directly in AWS CloudShell.

## Method 1: Use Git (Recommended)

If you have a GitHub account:

1. Push your code to GitHub:
```bash
cd /c/Users/GeorgeBrunner/Cursor/SocratIQAgents
git remote add origin https://github.com/YOUR_USERNAME/SocratIQAgents.git
git push -u origin master
```

2. In CloudShell:
```bash
git clone https://github.com/YOUR_USERNAME/SocratIQAgents.git
cd SocratIQAgents
chmod +x cloudshell-deploy.sh
./cloudshell-deploy.sh
```

## Method 2: Upload Individual Files

Upload just these key files to CloudShell using Actions → Upload:

From your local machine, upload these 3 files:
1. `cloudshell-deploy.sh`
2. `infrastructure/lambda/agent-lambdas.yaml`
3. All TypeScript files from `lambda/` folder (but NOT node_modules!)

Then in CloudShell, the deploy script will install node_modules fresh.

## Method 3: Push to Private Repo

Create a private GitHub repo and push there, then clone in CloudShell with a personal access token.

---

**Recommended**: Method 1 with GitHub. It's the cleanest and most reliable approach!
