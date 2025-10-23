"""
SocratIQ Multi-Agent Intelligence Platform
Streamlit Demo Application

This application provides an interactive interface to:
1. Chat with individual pharmaceutical intelligence agents
2. Generate comprehensive Target Product Profiles using Sophie orchestration
"""

import streamlit as st
import boto3
import json
from datetime import datetime
from typing import Dict, Any, Optional
import time

# Configure page
st.set_page_config(
    page_title="SocratIQ Intelligence Platform",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for attractive styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }
    .agent-card {
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid;
        margin: 1rem 0;
        background-color: #f8f9fa;
    }
    .vera-card { border-left-color: #667eea; }
    .finn-card { border-left-color: #f093fb; }
    .nora-card { border-left-color: #4facfe; }
    .clia-card { border-left-color: #43e97b; }
    .sophie-card { border-left-color: #fa709a; }
    .metric-box {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }
    .stButton>button {
        width: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: bold;
    }
    .response-box {
        background-color: #ffffff;
        padding: 1.5rem;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize AWS Lambda client
@st.cache_resource
def get_lambda_client():
    return boto3.client('lambda', region_name='us-east-1')

lambda_client = get_lambda_client()

# Agent configurations
AGENTS = {
    "VERA": {
        "name": "VERA",
        "full_name": "Product & Clinical Intelligence",
        "function": "SocratIQ-VERA-Agent-prod",
        "icon": "🔬",
        "description": "Expert in product architecture, formulation, manufacturing, stability, packaging, and quality systems",
        "color": "vera-card"
    },
    "FINN": {
        "name": "FINN",
        "full_name": "Financial & Investment Intelligence",
        "function": "SocratIQ-FINN-Agent-prod",
        "icon": "💰",
        "description": "Specialist in valuation, deal structure, due diligence, portfolio strategy, and risk assessment",
        "color": "finn-card"
    },
    "NORA": {
        "name": "NORA",
        "full_name": "Legal, Regulatory & IP Intelligence",
        "function": "SocratIQ-NORA-Agent-prod",
        "icon": "⚖️",
        "description": "Authority on regulatory pathways, FDA strategy, CRADAs, patent landscape, and compliance",
        "color": "nora-card"
    },
    "CLIA": {
        "name": "CLIA",
        "full_name": "Clinical Trials & Market Intelligence",
        "function": "SocratIQ-CLIA-Agent-prod",
        "icon": "📊",
        "description": "Expert in protocol design, clinical operations, market access, competitive intelligence, and evidence generation",
        "color": "clia-card"
    }
}

SOPHIE_CONFIG = {
    "name": "Sophie",
    "full_name": "Strategic Orchestration Engine",
    "function": "SocratIQ-Sophie-Orchestrator-prod",
    "icon": "🧠",
    "description": "Multi-agent coordinator using Tri-Paradigm Reasoning (Mechanistic, Deterministic, Probabilistic)",
    "color": "sophie-card"
}

# Initialize session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = {}
if 'tpp_history' not in st.session_state:
    st.session_state.tpp_history = []

def invoke_agent(agent_name: str, query: str) -> Dict[str, Any]:
    """Invoke a single agent Lambda function"""
    try:
        function_name = AGENTS[agent_name]["function"]

        payload = {
            "query": query,
            "traceId": f"streamlit-{int(time.time())}"
        }

        with st.spinner(f"Consulting {AGENTS[agent_name]['full_name']}..."):
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )

            result = json.loads(response['Payload'].read())

            # Handle API Gateway response format
            if 'statusCode' in result:
                if result['statusCode'] == 200:
                    body = json.loads(result['body']) if isinstance(result['body'], str) else result['body']
                    return body
                else:
                    return {"error": f"Agent returned status {result['statusCode']}"}

            return result

    except Exception as e:
        return {"error": str(e)}

def invoke_sophie(message: str) -> Dict[str, Any]:
    """Invoke Sophie orchestrator for multi-agent coordination"""
    try:
        payload = {
            "query": message,
            "traceId": f"streamlit-sophie-{int(time.time())}"
        }

        with st.spinner("Sophie is orchestrating multiple agents for comprehensive analysis..."):
            response = lambda_client.invoke(
                FunctionName=SOPHIE_CONFIG["function"],
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )

            result = json.loads(response['Payload'].read())

            # Handle API Gateway response format
            if 'statusCode' in result:
                if result['statusCode'] == 200:
                    body = json.loads(result['body']) if isinstance(result['body'], str) else result['body']
                    return body
                else:
                    return {"error": f"Sophie returned status {result['statusCode']}"}

            return result

    except Exception as e:
        return {"error": str(e)}

def display_agent_response(response: Dict[str, Any], agent_name: str):
    """Display agent response in an attractive format"""
    if "error" in response:
        st.error(f"Error: {response['error']}")
        return

    st.markdown('<div class="response-box">', unsafe_allow_html=True)

    # Agent header
    agent_info = AGENTS.get(agent_name, SOPHIE_CONFIG)
    st.markdown(f"### {agent_info['icon']} {agent_info['full_name']}")

    # Response content
    if 'response' in response:
        st.markdown(response['response'])
    elif 'recommendation' in response:
        st.markdown(response['recommendation'])

    # Metadata
    col1, col2, col3 = st.columns(3)
    with col1:
        if 'confidence' in response:
            st.metric("Confidence", f"{response['confidence']:.1%}")
    with col2:
        if 'timestamp' in response:
            st.metric("Timestamp", response['timestamp'].split('T')[1][:8])
    with col3:
        if 'sources' in response and response['sources']:
            st.metric("Sources", len(response['sources']))

    # Sources
    if 'sources' in response and response['sources']:
        with st.expander("📚 View Sources"):
            for i, source in enumerate(response['sources'], 1):
                st.markdown(f"**{i}. {source.get('title', 'Untitled')}**")
                if 'excerpt' in source:
                    st.text(source['excerpt'][:200] + "...")
                st.markdown("---")

    st.markdown('</div>', unsafe_allow_html=True)

def display_sophie_response(response: Dict[str, Any]):
    """Display Sophie's orchestrated response with tri-paradigm analysis"""
    if "error" in response:
        st.error(f"Error: {response['error']}")
        return

    st.markdown('<div class="response-box">', unsafe_allow_html=True)

    # Sophie header
    st.markdown(f"### {SOPHIE_CONFIG['icon']} {SOPHIE_CONFIG['full_name']}")

    # Main recommendation
    if 'recommendation' in response:
        st.markdown("#### 🎯 Strategic Recommendation")
        st.markdown(response['recommendation'])

    # Tri-Paradigm Analysis
    st.markdown("---")
    st.markdown("#### 🧬 Tri-Paradigm Analysis (SophieLogic™)")

    col1, col2, col3 = st.columns(3)

    with col1:
        if 'mechanisticAnalysis' in response and response['mechanisticAnalysis']:
            st.markdown("**⚙️ Mechanistic**")
            st.markdown(response['mechanisticAnalysis'])

    with col2:
        if 'deterministicScoring' in response and response['deterministicScoring']:
            st.markdown("**📐 Deterministic**")
            st.markdown(response['deterministicScoring'])

    with col3:
        if 'probabilisticRisk' in response and response['probabilisticRisk']:
            st.markdown("**🎲 Probabilistic**")
            st.markdown(response['probabilisticRisk'])

    # Agent Contributions
    if 'agentContributions' in response and response['agentContributions']:
        st.markdown("---")
        st.markdown("#### 🤝 Agent Contributions")
        for agent, contribution in response['agentContributions'].items():
            with st.expander(f"{AGENTS.get(agent, {}).get('icon', '🔹')} {agent}"):
                st.markdown(contribution)

    # Metadata
    st.markdown("---")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if 'confidence' in response:
            st.metric("Confidence", f"{response['confidence']:.1%}")
    with col2:
        if 'sources' in response:
            st.metric("Total Sources", len(response['sources']))
    with col3:
        if 'agentContributions' in response:
            st.metric("Agents Consulted", len(response['agentContributions']))
    with col4:
        if 'conflicts' in response and response['conflicts']:
            st.metric("Conflicts Identified", len(response['conflicts']))

    # Conflicts
    if 'conflicts' in response and response['conflicts']:
        st.markdown("---")
        st.warning("⚠️ **Conflicts Identified:**")
        for conflict in response['conflicts']:
            st.markdown(f"- {conflict}")

    st.markdown('</div>', unsafe_allow_html=True)

# Main application
def main():
    # Header
    st.markdown('<h1 class="main-header">🧬 SocratIQ Intelligence Platform</h1>', unsafe_allow_html=True)
    st.markdown("**Pharmaceutical Intelligence Powered by Multi-Agent AI**")

    # Sidebar navigation
    st.sidebar.markdown("## Navigation")
    app_mode = st.sidebar.radio(
        "Select Mode",
        ["🏠 Home", "💬 Agent Chat", "🎯 Generate TPP", "📊 History"]
    )

    if app_mode == "🏠 Home":
        show_home()
    elif app_mode == "💬 Agent Chat":
        show_agent_chat()
    elif app_mode == "🎯 Generate TPP":
        show_tpp_generator()
    elif app_mode == "📊 History":
        show_history()

def show_home():
    """Home page with Sophie interface for general questions"""
    st.markdown("## Welcome to SocratIQ")
    st.markdown("""
    SocratIQ is a multi-agent pharmaceutical intelligence platform that combines specialized AI agents
    to provide comprehensive analysis and strategic recommendations.
    """)

    # Sophie query interface at the top
    st.markdown(f"""
    <div class="agent-card {SOPHIE_CONFIG['color']}" style="margin-bottom: 2rem;">
        <h3>{SOPHIE_CONFIG['icon']} Ask Sophie - Strategic Orchestration Engine</h3>
        <p>{SOPHIE_CONFIG['description']}</p>
    </div>
    """, unsafe_allow_html=True)

    # JavaScript to enable Enter key submission
    st.markdown("""
    <script>
    const textareas = window.parent.document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const submitButton = window.parent.document.querySelector('button[kind="primaryFormSubmit"]');
                if (submitButton) submitButton.click();
            }
        });
    });
    </script>
    """, unsafe_allow_html=True)

    # Use form for Enter key submission
    with st.form(key="sophie_form", clear_on_submit=False):
        query = st.text_area(
            "Ask Sophie Anything",
            placeholder="e.g., Create a Target Product Profile for a novel oncology therapeutic\n\n(Press Enter to submit, Shift+Enter for new line)",
            height=120,
            help="Sophie will coordinate multiple specialist agents to provide comprehensive strategic recommendations",
            key="sophie_query"
        )

        col1, col2 = st.columns([3, 1])
        with col1:
            submit_button = st.form_submit_button("🧠 Ask Sophie", use_container_width=True, type="primary")
        with col2:
            clear_button = st.form_submit_button("🗑️ Clear", use_container_width=True)

    if clear_button:
        st.rerun()

    if submit_button and query:
        # Invoke Sophie
        response = invoke_sophie(query)

        # Save to history
        st.session_state.tpp_history.append({
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })

        # Display response
        st.markdown("---")
        display_sophie_response(response)

    # Show agent overview below
    st.markdown("---")
    st.markdown("### Specialized Agent Team")

    # Display agent cards
    col1, col2 = st.columns(2)

    agents_list = list(AGENTS.items())
    for idx, (agent_key, agent) in enumerate(agents_list):
        with col1 if idx % 2 == 0 else col2:
            st.markdown(f"""
            <div class="agent-card {agent['color']}">
                <h3>{agent['icon']} {agent['full_name']}</h3>
                <p>{agent['description']}</p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### Navigation")
    st.markdown("""
    - **💬 Agent Chat**: Ask specific questions to individual specialist agents
    - **🎯 Generate TPP**: Create comprehensive Target Product Profiles with structured guidance
    - **📊 History**: Review your previous queries and analyses
    """)

def show_agent_chat():
    """Individual agent chat interface"""
    st.markdown("## 💬 Chat with Agents")
    st.markdown("Ask questions to individual specialized agents")

    # Agent selection
    col1, col2 = st.columns([1, 3])

    with col1:
        selected_agent = st.selectbox(
            "Select Agent",
            options=list(AGENTS.keys()),
            format_func=lambda x: f"{AGENTS[x]['icon']} {AGENTS[x]['name']}"
        )

    with col2:
        st.markdown(f"**{AGENTS[selected_agent]['full_name']}**")
        st.markdown(AGENTS[selected_agent]['description'])

    # Chat interface
    query = st.text_area(
        "Your Question",
        placeholder="e.g., What are best practices for Phase 3 enrollment strategies?",
        height=100
    )

    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        submit_button = st.button("🚀 Ask Agent", use_container_width=True)
    with col2:
        if st.button("🗑️ Clear", use_container_width=True):
            st.rerun()

    if submit_button and query:
        # Invoke agent
        response = invoke_agent(selected_agent, query)

        # Save to history
        if selected_agent not in st.session_state.chat_history:
            st.session_state.chat_history[selected_agent] = []

        st.session_state.chat_history[selected_agent].append({
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })

        # Display response
        st.markdown("---")
        display_agent_response(response, selected_agent)

    # Show recent history for this agent
    if selected_agent in st.session_state.chat_history and st.session_state.chat_history[selected_agent]:
        st.markdown("---")
        st.markdown("### Recent Queries")
        for item in reversed(st.session_state.chat_history[selected_agent][-3:]):
            with st.expander(f"📝 {item['query'][:60]}..."):
                st.markdown(f"**Query:** {item['query']}")
                st.markdown(f"**Time:** {item['timestamp']}")

def show_tpp_generator():
    """Target Product Profile generator using Sophie"""
    st.markdown("## 🎯 Generate Target Product Profile")
    st.markdown("Generate comprehensive Target Product Profiles using Sophie's multi-agent orchestration")

    # Drug name input
    drug_name = st.text_input(
        "Drug Name",
        placeholder="e.g., Pembrolizumab, Nivolumab, Atezolizumab",
        help="Enter the name of the drug for which you want to generate a Target Product Profile"
    )

    # Therapeutic area (optional)
    therapeutic_area = st.text_input(
        "Therapeutic Area (Optional)",
        placeholder="e.g., Oncology, Immunology, Cardiovascular",
        help="Specify the therapeutic area to focus the analysis"
    )

    # TPP components to include
    st.markdown("### TPP Components to Include")
    col1, col2, col3 = st.columns(3)

    with col1:
        include_product = st.checkbox("Product Architecture", value=True)
        include_clinical = st.checkbox("Clinical Strategy", value=True)
    with col2:
        include_regulatory = st.checkbox("Regulatory Pathway", value=True)
        include_financial = st.checkbox("Financial Analysis", value=True)
    with col3:
        include_market = st.checkbox("Market Assessment", value=True)
        include_ip = st.checkbox("IP Landscape", value=True)

    # Generate button
    col1, col2 = st.columns([2, 1])
    with col1:
        generate_button = st.button("🧠 Generate TPP with Sophie", use_container_width=True)

    if generate_button and drug_name:
        # Build comprehensive query
        components = []
        if include_product:
            components.append("product architecture and formulation strategy")
        if include_clinical:
            components.append("clinical trial design and enrollment strategy")
        if include_regulatory:
            components.append("regulatory pathway and FDA strategy")
        if include_financial:
            components.append("valuation and investment potential")
        if include_market:
            components.append("market access and competitive landscape")
        if include_ip:
            components.append("patent landscape and IP strategy")

        therapeutic_context = f" in {therapeutic_area}" if therapeutic_area else ""

        message = f"""Generate a comprehensive Target Product Profile for {drug_name}{therapeutic_context}.

Please analyze and provide insights on:
{chr(10).join(f'- {comp}' for comp in components)}

Use publicly available information and provide evidence-based recommendations with citations."""

        # Invoke Sophie
        response = invoke_sophie(message)

        # Save to history
        st.session_state.tpp_history.append({
            "drug_name": drug_name,
            "therapeutic_area": therapeutic_area or "Not specified",
            "response": response,
            "timestamp": datetime.now().isoformat()
        })

        # Display response
        st.markdown("---")
        st.markdown(f"## Target Product Profile: {drug_name}")
        display_sophie_response(response)

        # Download option
        st.markdown("---")
        tpp_json = json.dumps(response, indent=2)
        st.download_button(
            label="📥 Download TPP as JSON",
            data=tpp_json,
            file_name=f"TPP_{drug_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            mime="application/json"
        )

def show_history():
    """Display query history"""
    st.markdown("## 📊 Query History")

    tab1, tab2 = st.tabs(["💬 Agent Chats", "🎯 TPP Reports"])

    with tab1:
        st.markdown("### Agent Chat History")
        if st.session_state.chat_history:
            for agent, history in st.session_state.chat_history.items():
                if history:
                    st.markdown(f"#### {AGENTS[agent]['icon']} {AGENTS[agent]['full_name']}")
                    for idx, item in enumerate(reversed(history), 1):
                        with st.expander(f"{idx}. {item['query'][:80]}... ({item['timestamp'].split('T')[0]})"):
                            st.markdown(f"**Query:** {item['query']}")
                            st.markdown(f"**Time:** {item['timestamp']}")
                            display_agent_response(item['response'], agent)
        else:
            st.info("No chat history yet. Start a conversation in Agent Chat!")

    with tab2:
        st.markdown("### Target Product Profile History")
        if st.session_state.tpp_history:
            for idx, item in enumerate(reversed(st.session_state.tpp_history), 1):
                with st.expander(f"{idx}. {item['drug_name']} - {item['therapeutic_area']} ({item['timestamp'].split('T')[0]})"):
                    st.markdown(f"**Drug:** {item['drug_name']}")
                    st.markdown(f"**Therapeutic Area:** {item['therapeutic_area']}")
                    st.markdown(f"**Generated:** {item['timestamp']}")
                    st.markdown("---")
                    display_sophie_response(item['response'])
        else:
            st.info("No TPP history yet. Generate your first TPP!")

if __name__ == "__main__":
    main()
