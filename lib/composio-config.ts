// Composio Configuration
// This file contains the backend configuration for Composio integration

export const COMPOSIO_CONFIG = {
  // Your Composio API key - stored securely on backend
  API_KEY: 'ak_NVhcTNsYirgh4wv-cYpr',
  
  // Base URL for Composio API
  BASE_URL: 'https://backend.composio.dev/api/v1',
  
  // Supported integrations that use Composio
  COMPOSIO_CONNECTORS: [
    // Core Communication & Productivity
    'gmail',
    'slack', 
    'notion',
    'googlesheets',
    'googledrive',
    
    // Developer & Project Management
    'github',
    'jira',
    'linear',
    'asana',
    
    // CRM & Sales
    'hubspot',
    'salesforce',
    'pipedrive',
    
    // Communication & Meetings
    'zoom',
    'calendly',
    'googlecalendar',
    
    // Finance & Payments
    'stripe',
    'quickbooks',
    
    // E-commerce
    'shopify',
    
    // Analytics & Data
    'googleanalytics',
    'mixpanel',
    
    // Design & Creative
    'figma',
    'canva',
    
    // Support & Customer Service
    'zendesk',
    'intercom',
    
    // Marketing
    'mailchimp',
    'linkedin'
  ] as const,
  
  // Custom connectors that don't use Composio
  CUSTOM_CONNECTORS: [
    'agent-api',
    'marketplace',
    'http',
    'webhook',
    'custom'
  ] as const
}

// Helper function to check if a connector uses Composio
export function isComposioConnector(connectorType: string): boolean {
  return COMPOSIO_CONFIG.COMPOSIO_CONNECTORS.includes(connectorType as any)
}

// Helper function to get Composio auth URL for a connector
export function getComposioAuthUrl(connectorType: string, entityId: string): string {
  if (!isComposioConnector(connectorType)) {
    throw new Error(`${connectorType} is not a Composio connector`)
  }
  
  return `${COMPOSIO_CONFIG.BASE_URL}/connectedAccounts?app=${connectorType}&entityId=${entityId}`
}

// Helper function to make authenticated Composio API calls
export async function callComposioAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${COMPOSIO_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': COMPOSIO_CONFIG.API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Composio API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}
