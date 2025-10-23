# SocratIQ Streamlit Demo Application

An attractive, interactive web interface for the SocratIQ Multi-Agent Pharmaceutical Intelligence Platform.

## Features

### 🏠 Home
- Overview of all available agents
- Agent capabilities and descriptions
- Quick start guide

### 💬 Agent Chat
- Chat with individual specialized agents:
  - **VERA** - Product & Clinical Intelligence
  - **FINN** - Financial & Investment Intelligence
  - **NORA** - Legal, Regulatory & IP Intelligence
  - **CLIA** - Clinical Trials & Market Intelligence
- View confidence scores and source citations
- Access chat history for each agent

### 🎯 Generate Target Product Profile (TPP)
- Generate comprehensive TPPs using Sophie orchestration
- Enter drug name and therapeutic area
- Select TPP components to include:
  - Product architecture and formulation
  - Clinical trial strategy
  - Regulatory pathway
  - Financial analysis
  - Market assessment
  - IP landscape
- View tri-paradigm analysis (Mechanistic, Deterministic, Probabilistic)
- See which agents contributed to the analysis
- Download TPP as JSON

### 📊 History
- Review all previous agent chats
- Access generated TPP reports
- Browse by agent or drug name

## Installation

### Prerequisites
- Python 3.8 or higher
- AWS credentials configured (for Lambda invocation)
- Access to SocratIQ Lambda functions in us-east-1

### Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure AWS credentials:**
   ```bash
   # Option 1: AWS CLI
   aws configure

   # Option 2: Environment variables
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

3. **Verify Lambda access:**
   ```bash
   aws lambda list-functions --query 'Functions[?contains(FunctionName, `SocratIQ`)].FunctionName'
   ```

## Running the Application

### Local Development

```bash
streamlit run streamlit_app.py
```

The application will open in your default browser at `http://localhost:8501`

### Custom Port

```bash
streamlit run streamlit_app.py --server.port 8080
```

### Deploy to Streamlit Cloud

1. Push code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your repository
4. Add AWS credentials in Streamlit Secrets:
   ```toml
   [aws]
   AWS_ACCESS_KEY_ID = "your_access_key"
   AWS_SECRET_ACCESS_KEY = "your_secret_key"
   AWS_DEFAULT_REGION = "us-east-1"
   ```
5. Deploy!

## Usage Examples

### Example 1: Chat with VERA about Formulation
1. Navigate to **Agent Chat**
2. Select **VERA** agent
3. Ask: "What are best practices for stability testing of biologics?"
4. View the response with confidence score and citations

### Example 2: Generate TPP for Pembrolizumab
1. Navigate to **Generate TPP**
2. Enter drug name: `Pembrolizumab`
3. Enter therapeutic area: `Oncology`
4. Select all TPP components
5. Click **Generate TPP with Sophie**
6. Review the comprehensive analysis including:
   - Multi-agent insights
   - Tri-paradigm reasoning
   - Agent contributions
   - Source citations
7. Download the TPP as JSON

### Example 3: Ask Sophie About CRADA Strategy
1. Navigate to **Generate TPP**
2. Enter drug name: `Novel Immunotherapy Asset`
3. Select: Regulatory Pathway, Financial Analysis, IP Landscape
4. Sophie will orchestrate NORA, FINN, and other relevant agents
5. View synthesized strategic recommendations

## Application Structure

```
streamlit_app.py          # Main application
requirements.txt          # Python dependencies
README_STREAMLIT.md      # This file
```

## Key Features

### Attractive UI
- Gradient headers and agent cards
- Color-coded agents (VERA: purple, FINN: pink, NORA: blue, CLIA: green, Sophie: rose)
- Responsive layout
- Custom CSS styling

### Smart Agent Invocation
- Direct Lambda invocation via boto3
- Handles both direct and API Gateway response formats
- Error handling and user feedback
- Loading spinners during API calls

### Session Management
- Chat history preserved during session
- TPP history tracking
- Download options for TPP reports

### Multi-Agent Orchestration
- Sophie coordinates multiple agents
- Displays agent contributions
- Shows tri-paradigm analysis
- Identifies conflicts between agents

## Troubleshooting

### Lambda Invocation Errors

**Error: Access Denied**
- Verify AWS credentials are configured
- Check IAM permissions for Lambda invocation
- Ensure you're in the correct AWS region (us-east-1)

**Error: Function Not Found**
- Verify Lambda functions are deployed
- Check function names match the configuration
- Run: `aws lambda list-functions`

### Streamlit Errors

**ModuleNotFoundError**
```bash
pip install -r requirements.txt
```

**Port Already in Use**
```bash
streamlit run streamlit_app.py --server.port 8502
```

## AWS IAM Permissions Required

Your AWS credentials need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:*:function/SocratIQ-*"
      ]
    }
  ]
}
```

## Customization

### Change Lambda Functions
Edit the `AGENTS` and `SOPHIE_CONFIG` dictionaries in `streamlit_app.py`:

```python
AGENTS = {
    "VERA": {
        "function": "SocratIQ-VERA-Agent-prod",  # Change function name
        ...
    }
}
```

### Modify Styling
Edit the custom CSS in the `st.markdown()` block at the top of `streamlit_app.py`

### Add New Features
The application is modular:
- `show_home()` - Home page
- `show_agent_chat()` - Agent chat interface
- `show_tpp_generator()` - TPP generation
- `show_history()` - History viewer

## Performance

- **Agent Response Time:** 5-30 seconds (depends on corpus size and query complexity)
- **Sophie Orchestration:** 30-120 seconds (coordinates multiple agents)
- **Concurrent Users:** Supports multiple users (Lambda scales automatically)

## Support

For issues or questions:
1. Check CloudWatch Logs for Lambda errors
2. Verify network connectivity to AWS
3. Review Streamlit logs in terminal

## License

Proprietary - Acumen Analytics

---

**Built with:** Streamlit, AWS Lambda, AWS Bedrock, Claude 3.5 Sonnet
