"""
AI Service Module
OpenAI API integration for AI-powered features
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

class AIService:
    """AI Service for OpenAI integration"""

    def __init__(self):
        self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
        self.max_tokens = int(os.getenv('OPENAI_MAX_TOKENS', 1000))

    def chat(self, message, conversation_history=None, system_prompt=None):
        """
        Send a chat message to OpenAI and get response

        Args:
            message (str): User message
            conversation_history (list): Previous conversation messages
            system_prompt (str): System prompt for context

        Returns:
            dict: Response with text, tokens_used, and model
        """
        try:
            messages = []

            # Add system prompt if provided
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            else:
                messages.append({
                    "role": "system",
                    "content": "You are a helpful AI assistant for website administration. You help with content management, SEO optimization, marketing insights, and general website-related questions."
                })

            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history)

            # Add current message
            messages.append({"role": "user", "content": message})

            # Call OpenAI API
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.7
            )

            return {
                'text': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens,
                'model': self.model,
                'finish_reason': response.choices[0].finish_reason
            }

        except Exception as e:
            return {
                'error': str(e),
                'text': None,
                'tokens_used': 0,
                'model': self.model
            }

    def generate_seo_suggestions(self, page_content, current_seo=None):
        """
        Generate SEO suggestions for a page

        Args:
            page_content (str): Page content
            current_seo (dict): Current SEO settings

        Returns:
            dict: SEO suggestions
        """
        prompt = f"""Analyze the following page content and provide SEO optimization suggestions:

Page Content:
{page_content[:1000]}  # Limit to first 1000 chars

Current SEO:
Title: {current_seo.get('title', 'Not set') if current_seo else 'Not set'}
Description: {current_seo.get('description', 'Not set') if current_seo else 'Not set'}
Keywords: {current_seo.get('keywords', 'Not set') if current_seo else 'Not set'}

Please provide:
1. Suggested meta title (max 60 characters)
2. Suggested meta description (max 160 characters)
3. 5-10 relevant keywords
4. Content optimization tips

Format your response as JSON."""

        response = self.chat(prompt)
        return response

    def generate_marketing_insights(self, analytics_data):
        """
        Generate marketing insights from analytics data

        Args:
            analytics_data (dict): Analytics data

        Returns:
            dict: Marketing insights
        """
        prompt = f"""Analyze the following website analytics data and provide marketing insights:

Analytics Data:
{analytics_data}

Please provide:
1. Key trends and patterns
2. Actionable recommendations
3. Areas for improvement
4. Growth opportunities

Keep the response concise and actionable."""

        response = self.chat(prompt)
        return response

    def suggest_content_improvements(self, content, content_type='general'):
        """
        Suggest improvements for website content

        Args:
            content (str): Current content
            content_type (str): Type of content (hero, about, services, etc.)

        Returns:
            dict: Content improvement suggestions
        """
        prompt = f"""Review this website {content_type} content and suggest improvements:

Current Content:
{content}

Provide suggestions for:
1. Clarity and engagement
2. Call-to-action optimization
3. Tone and voice
4. Visual appeal (if applicable)

Keep suggestions practical and actionable."""

        response = self.chat(prompt)
        return response

    def generate_email_response(self, customer_message, context='general'):
        """
        Generate a professional email response

        Args:
            customer_message (str): Customer's message
            context (str): Context (inquiry, complaint, etc.)

        Returns:
            dict: Generated email response
        """
        prompt = f"""Generate a professional email response to this customer message:

Customer Message:
{customer_message}

Context: {context}

The response should be:
- Professional and friendly
- Concise but thorough
- Address all points raised
- Include appropriate call-to-action

Generate only the email body, no subject line."""

        response = self.chat(prompt)
        return response

# Create singleton instance
ai_service = AIService()
