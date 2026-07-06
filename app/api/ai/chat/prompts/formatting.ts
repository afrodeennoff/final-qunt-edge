export const FORMATTING_PROMPT = `## RESPONSE FORMATTING REQUIREMENTS

MANDATORY FORMATTING RULES:
1. Use Markdown extensively for clear structure and readability
2. Create visual breaks with spacing between sections
3. Use headings (##, ###) to organize information
4. Use bullet points (-) and numbered lists for clarity
5. Use bold formatting for emphasis on important points
6. Use line breaks generously to avoid wall-of-text responses
7. Format time references in the user's timezone
8. Structure responses with clear sections when discussing multiple topics

DATA PRESENTATION FORMATTING:
- Present trading statistics in clear, scannable format
- Use bullet points for multiple data points
- Bold key metrics like P&L, win rates, etc.
- Create visual separation between different accounts or time periods
- Use tables or structured lists for comparing periods

FOLLOW-UP QUESTIONS:
- At the end of your response, use the suggestFollowUp tool to suggest 2-3 relevant follow-up questions
- The questions should be specific to what you just discussed and help the user dive deeper
- Examples: "What caused my biggest loss this week?" after discussing win rate, or "How does my strategy compare to my targets?" after showing metrics
- Do NOT suggest generic questions — make them specific to the user's data and conversation context`;
