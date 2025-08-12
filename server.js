import express from 'express';
import cors from 'cors';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables for API endpoints
const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE || 'http://ai1.strategicerpcloud.com:11111';

console.log('Server starting with configuration:');
console.log('EXTERNAL_API_BASE:', EXTERNAL_API_BASE);
console.log('PORT:', PORT);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Matching API',
      version: '1.0.0',
      description: 'API for job matching application with domain filtering and user profile management',
      contact: {
        name: 'Job Matching Team',
        email: 'support@jobmatch.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'Unique user identifier' },
            industry: { type: 'string', description: 'User preferred industry' },
            domains: { type: 'array', items: { type: 'string' }, description: 'User domains of interest' },
            details: { type: 'object', description: 'Full user profile details' },
            links: { type: 'array', items: { type: 'string' }, description: 'Company career page URLs' }
          }
        },
        JobMatch: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Job ID' },
            title: { type: 'string', description: 'Job title' },
            company: { type: 'string', description: 'Company name' },
            location: { type: 'string', description: 'Job location' },
            salary: { type: 'string', description: 'Salary range' },
            description: { type: 'string', description: 'Job description' },
            match_score: { type: 'integer', description: 'Match percentage' },
            job_details: {
              type: 'object',
              properties: {
                details: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    company_name: { type: 'string' },
                    location: { type: 'string' }
                  }
                }
              }
            },
            match_result: {
              type: 'object',
              properties: {
                overall_match: { type: 'integer' },
                skills_match: { type: 'integer' },
                experience_match: { type: 'integer' }
              }
            }
          }
        },
        Statistics: {
          type: 'object',
          properties: {
            matched_jobs_count: { type: 'integer', description: 'Total matched jobs count' },
            recommended_jobs_count: { type: 'integer', description: 'Total recommended jobs count' },
            total_applications: { type: 'integer', description: 'Total applications sent' },
            average_match_score: { type: 'number', description: 'Average match score' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            details: { type: 'string', description: 'Error details' }
          }
        }
      }
    }
  },
  apis: ['./server.js'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: [
    'https://match-patrol-frontend.vercel.app',
    'https://match-patrol-frontend-git-main-aloksingh1008.vercel.app',
    'https://match-patrol-frontend-aloksingh1008.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Job Matching API Documentation'
}));

// Serve Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`📋 Headers:`, req.headers);
  console.log(`📦 Body:`, req.body);
  console.log(`🔗 Query:`, req.query);
  console.log(`👤 User-Agent:`, req.headers['user-agent']);
  console.log(`📍 Origin:`, req.headers.origin);
  console.log('─'.repeat(80));
  
  // Capture original res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`\n📤 [${timestamp}] Response for ${req.method} ${req.url}`);
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📄 Response Data:`, JSON.stringify(data, null, 2));
    console.log('═'.repeat(80));
    return originalJson.call(this, data);
  };
  
  next();
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:45.123Z
 */
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test external API connectivity
app.get('/api/test-external', async (req, res) => {
  try {
    console.log('Testing external API connectivity...');
    const response = await axios.get(`${EXTERNAL_API_BASE}/health`, {
      timeout: 5000
    });
    res.json({ 
      status: 'External API reachable',
      response: response.data 
    });
  } catch (error) {
    console.error('External API test failed:', error.message);
    res.status(503).json({ 
      status: 'External API unreachable',
      error: error.message 
    });
  }
});

// Update user endpoint
app.post('/api/update-user', async (req, res) => {
  try {
    const { user_id, industry, domains, details, links } = req.body;

    // Validate required fields
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id is required and must be a string' });
    }

    // Transform payload for external API
    const payload = {
      user_id: String(user_id),
      industry: String(industry || 'Technology'),
      domains: Array.isArray(domains) ? domains : [],
      details: typeof details === 'object' ? details : {},
      links: Array.isArray(links) ? links : []
    };

    // Send to external API
    const response = await axios.post(`${EXTERNAL_API_BASE}/update-user/`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * @swagger
 * /api/get-user/{displayId}:
 *   get:
 *     summary: Get user profile details
 *     description: Fetches user profile information from external API using POST request to external endpoint
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: displayId
 *         required: true
 *         schema:
 *           type: string
 *         description: User's display ID
 *         example: alok090602
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   description: User profile data including domains, skills, experience
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 19
 *                     user_id:
 *                       type: string
 *                       example: alok090602
 *                     details:
 *                       type: object
 *                       description: Complete user profile details
 *                     domains:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["google.com", "amazon.jobs", "metacareers.com"]
 *                     industry:
 *                       type: string
 *                       example: "Technology & IT"
 *                     links:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://www.google.com/about/careers/applications/"]
 *                 status:
 *                   type: string
 *                   example: success
 *       400:
 *         description: Display ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to fetch user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get user endpoint
app.get('/api/get-user/:displayId', async (req, res) => {
  try {
    const { displayId } = req.params;

    if (!displayId) {
      return res.status(400).json({ error: 'Display ID is required' });
    }

    console.log(`🔍 Fetching user data for displayId: ${displayId}`);

    // Try to fetch from external API with shorter timeout
    try {
      const externalApiUrl = `${EXTERNAL_API_BASE}/get-user-detail/`;
      const apiPayload = { user_id: displayId };
      
      console.log(`🎯 External API URL: ${externalApiUrl}`);
      console.log(`🔧 External API Method: POST`);
      console.log(`📡 External API Payload:`, JSON.stringify(apiPayload, null, 2));
      
      // Log the exact request being made
      console.log(`🌐 EXACT REQUEST DETAILS:`);
      console.log(`   URL: ${externalApiUrl}`);
      console.log(`   Method: POST`);
      console.log(`   Headers: { "Content-Type": "application/json" }`);
      console.log(`   Body: ${JSON.stringify(apiPayload)}`);
      
      console.log('🚀 Making POST request to external API...');
      
      const response = await axios.post(externalApiUrl, apiPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // Reduced timeout to 5 seconds
      });

      console.log('✅ External API response status:', response.status);
      console.log('📄 External API response data:', response.data);

      // Extract domain information from the response if available
      if (response.data?.message?.domain) {
        const domainsInfo = response.data.message.domain;
        if (domainsInfo) {
          // Store domains info in userProfile for use in filtering
          if (response.data.message) {
            if (Array.isArray(domainsInfo)) {
              response.data.message.domains = domainsInfo;
            } else if (typeof domainsInfo === 'string') {
              response.data.message.domains = [domainsInfo];
            } else {
              response.data.message.domains = [];
            }
          }
        }
      }

      // Ensure domains field exists (it seems the API already provides it)
      if (response.data?.message && !response.data.message.domains) {
        response.data.message.domains = response.data.message.domains || [];
      }

      console.log('✅ Processed response with domains:', {
        hasDomains: !!response.data?.message?.domains,
        domainsCount: response.data?.message?.domains?.length || 0,
        domains: response.data?.message?.domains
      });

      res.json(response.data);
    } catch (externalError) {
      console.error('🚨 EXTERNAL API FAILED - DETAILED ERROR INFO:');
      console.error('─'.repeat(80));
      console.error('Error message:', externalError.message);
      console.error('Error code:', externalError.code);
      console.error('Error stack:', externalError.stack);
      
      if (externalError.response) {
        console.error('Response status:', externalError.response.status);
        console.error('Response statusText:', externalError.response.statusText);
        console.error('Response headers:', externalError.response.headers);
        console.error('Response data:', externalError.response.data);
      } else if (externalError.request) {
        console.error('Request was made but no response received:');
        console.error('Request config:', externalError.config);
      } else {
        console.error('Error setting up request:', externalError.message);
      }
      console.error('─'.repeat(80));
      console.error('🔄 Using fallback data instead...');
      
      // Return fallback data structure
      const fallbackData = {
        message: {
          user_id: displayId,
          name: "User",
          email: `${displayId}@example.com`,
          location: "Unknown",
          skills: [],
          experience: [],
          domains: [],
          jobPreferences: {
            preferredIndustry: "Technology",
            preferredLocation: "Remote",
            salaryRange: "50000-80000"
          }
        },
        status: "fallback"
      };
      
      res.json(fallbackData);
    }
  } catch (error) {
    console.error('Error in /api/get-user/:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Return more specific error messages
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'External API service unavailable' });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({ error: 'External API request timeout' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/get-match-results/:
 *   post:
 *     summary: Get matched jobs for user
 *     description: Fetches job matches for a user with optional domain filtering
 *     tags:
 *       - Job Matching
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User's unique identifier
 *                 example: alok090602
 *               offset:
 *                 type: integer
 *                 description: Pagination offset
 *                 default: 0
 *                 example: 0
 *               limit:
 *                 type: integer
 *                 description: Number of results to return
 *                 default: 10
 *                 example: 10
 *               domain:
 *                 type: string
 *                 description: Domain filter (empty string for all jobs)
 *                 example: Technology
 *     responses:
 *       200:
 *         description: Job matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobMatch'
 *       400:
 *         description: user_id is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to fetch match results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get match results endpoint
app.post('/api/get-match-results/', async (req, res) => {
  try {
    const { user_id, offset = 0, limit = 10, domain = '' } = req.body;

    console.log('📥 Match results request:', {
      user_id,
      offset,
      limit,
      domain,
      hasDomain: !!domain,
      domainType: typeof domain
    });

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Prepare payload for external API
    const payload = {
      user_id: String(user_id),
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    // Add domain parameter if provided
    if (domain && domain.trim() !== '') {
      payload.domain = domain.trim();
      console.log('🎯 Adding domain filter to external API request:', payload.domain);
    } else {
      console.log('🌐 No domain filter applied (showing all jobs)');
    }

    console.log('🚀 Sending to external API:', payload);

    // Try to fetch from external API with shorter timeout
    try {
      const externalApiUrl = `${EXTERNAL_API_BASE}/get-match-results/`;
      console.log(`🎯 External API URL: ${externalApiUrl}`);
      console.log(`🔧 External API Method: POST`);
      console.log(`📡 External API Payload:`, JSON.stringify(payload, null, 2));
      
      const response = await axios.post(externalApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const results = response.data?.message || [];
      console.log('✅ External API response:', {
        resultsCount: results.length,
        domain: domain || 'all',
        firstResult: results[0] ? {
          title: results[0].job_details?.details?.title,
          company: results[0].job_details?.details?.company_name
        } : 'No results'
      });
      
      res.json({ message: results });
    } catch (externalError) {
      console.error('❌ External API failed for match results:', externalError.message);
      console.log('🔄 Using fallback data with domain consideration');
      
      // Return fallback job matches with domain-aware filtering
      let fallbackJobs = [
        {
          id: 1,
          title: "Software Engineer",
          company: "Tech Corp",
          location: "Remote",
          salary: "$80,000 - $120,000",
          description: "Full-stack development role with modern technologies",
          match_score: 85,
          job_details: {
            details: {
              title: "Software Engineer",
              company_name: "Tech Corp",
              location: "Remote"
            }
          },
          match_result: {
            overall_match: 85,
            skills_match: 90,
            experience_match: 80
          }
        },
        {
          id: 2,
          title: "Frontend Developer",
          company: "Startup Inc",
          location: "San Francisco, CA",
          salary: "$90,000 - $130,000",
          description: "React/Vue.js development for innovative startup",
          match_score: 78,
          job_details: {
            details: {
              title: "Frontend Developer",
              company_name: "Startup Inc",
              location: "San Francisco, CA"
            }
          },
          match_result: {
            overall_match: 78,
            skills_match: 85,
            experience_match: 70
          }
        },
        {
          id: 3,
          title: "Data Scientist",
          company: "Analytics Pro",
          location: "New York, NY",
          salary: "$100,000 - $140,000",
          description: "Machine learning and data analysis role",
          match_score: 82,
          job_details: {
            details: {
              title: "Data Scientist",
              company_name: "Analytics Pro",
              location: "New York, NY"
            }
          },
          match_result: {
            overall_match: 82,
            skills_match: 88,
            experience_match: 75
          }
        }
      ];
      
      // Apply domain filtering to fallback data
      if (domain && domain.trim() !== '' && domain !== 'all') {
        const filterDomain = domain.toLowerCase();
        fallbackJobs = fallbackJobs.filter(job => {
          const jobTitle = job.title.toLowerCase();
          const jobCompany = job.company.toLowerCase();
          
          // Simple domain matching logic
          if (filterDomain.includes('technology') || filterDomain.includes('software')) {
            return jobTitle.includes('engineer') || jobTitle.includes('developer') || jobTitle.includes('software');
          } else if (filterDomain.includes('data')) {
            return jobTitle.includes('data') || jobTitle.includes('scientist') || jobTitle.includes('analyst');
          }
          // Add more domain filtering logic as needed
          return true;
        });
        
        console.log(`🎯 Filtered fallback jobs for domain "${domain}":`, {
          originalCount: 3,
          filteredCount: fallbackJobs.length,
          jobs: fallbackJobs.map(j => j.title)
        });
      }
      
      res.json({ message: fallbackJobs });
    }
  } catch (error) {
    console.error('❌ Error in match results endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch match results' });
  }
});

// Get recommended match results endpoint
app.post('/api/get-recommended-match-results/', async (req, res) => {
  try {
    const { user_id, offset = 0, limit = 5, domain = '' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Prepare payload for external API
    const payload = {
      user_id: String(user_id),
      offset: parseInt(offset),
      limit: parseInt(limit)
    };

    // Add domain parameter if provided
    if (domain && domain.trim() !== '') {
      payload.domain = domain.trim();
    }

    // Try to fetch from external API with shorter timeout
    try {
      const response = await axios.post(`${EXTERNAL_API_BASE}/get-recommended-match-results/`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const results = response.data?.message || [];
      res.json({ message: results });
    } catch (externalError) {
      console.error('External API failed for recommended results, using fallback:', externalError.message);
      
      // Return fallback recommended jobs
      const fallbackRecommended = [
        {
          id: 3,
          title: "Senior Developer",
          company: "Enterprise Solutions",
          location: "New York, NY",
          salary: "$120,000 - $160,000",
          description: "Senior role with leadership opportunities",
          match_score: 92
        }
      ];
      
      res.json({ message: fallbackRecommended });
    }
  } catch (error) {
    console.error('Error fetching recommended results:', error.message);
    res.status(500).json({ error: 'Failed to fetch recommended results' });
  }
});

/**
 * @swagger
 * /api/get-match-statistics/:
 *   post:
 *     summary: Get user match statistics
 *     description: Fetches statistics about user's job matches and applications
 *     tags:
 *       - Statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User's unique identifier
 *                 example: alok090602
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   $ref: '#/components/schemas/Statistics'
 *       400:
 *         description: user_id is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to fetch statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get match statistics endpoint
app.post('/api/get-match-statistics/', async (req, res) => {
  try {
    const { user_id } = req.body;

    console.log('📊 Statistics request:', { user_id });

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Try to fetch statistics from external API
    try {
      const externalApiUrl = `${EXTERNAL_API_BASE}/get-match-statistics/`;
      const payload = { user_id: String(user_id) };
      
      console.log(`🎯 External API URL: ${externalApiUrl}`);
      console.log(`🔧 External API Method: POST`);
      console.log(`📡 External API Payload:`, JSON.stringify(payload, null, 2));
      
      const statsRes = await axios.post(externalApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ Statistics API response:', {
        status: statsRes.status,
        data: statsRes.data
      });

      res.json(statsRes.data);
    } catch (externalError) {
      console.error('External API failed for statistics, using fallback:', externalError.message);
      
      // Return fallback statistics
      const fallbackStats = {
        message: {
          matched_jobs_count: 15,
          recommended_jobs_count: 8,
          total_applications: 3,
          average_match_score: 78.5
        }
      };
      
      res.json(fallbackStats);
    }
  } catch (error) {
    console.error('Error fetching statistics:', error.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @swagger
 * /api/debug/external-user/{displayId}:
 *   get:
 *     summary: Debug external API user call
 *     description: Direct test of external API to debug issues
 *     tags:
 *       - Debug
 *     parameters:
 *       - in: path
 *         name: displayId
 *         required: true
 *         schema:
 *           type: string
 *         description: User's display ID
 *         example: alok090602
 *     responses:
 *       200:
 *         description: Raw external API response
 *       500:
 *         description: External API error
 */
// Debug endpoint for external API testing
app.get('/api/debug/external-user/:displayId', async (req, res) => {
  try {
    const { displayId } = req.params;
    
    console.log('🔧 DEBUG: Testing external API directly for:', displayId);
    
    const externalApiUrl = `${EXTERNAL_API_BASE}/get-user-detail/`;
    const apiPayload = { user_id: displayId };
    
    console.log('🔧 DEBUG: External API URL:', externalApiUrl);
    console.log('🔧 DEBUG: External API Method: POST');
    console.log('🔧 DEBUG: External API Payload:', JSON.stringify(apiPayload, null, 2));
    
    const startTime = Date.now();
    const response = await axios.post(externalApiUrl, apiPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    const endTime = Date.now();
    
    console.log('🔧 DEBUG: Response received in', endTime - startTime, 'ms');
    console.log('🔧 DEBUG: Response status:', response.status);
    console.log('🔧 DEBUG: Response headers:', response.headers);
    console.log('🔧 DEBUG: Response data:', JSON.stringify(response.data, null, 2));
    
    res.json({
      debug: true,
      requestUrl: externalApiUrl,
      requestMethod: 'POST',
      requestPayload: apiPayload,
      responseTime: endTime - startTime,
      responseStatus: response.status,
      responseHeaders: response.headers,
      responseData: response.data
    });
    
  } catch (error) {
    console.error('🔧 DEBUG: External API error:', error.message);
    console.error('🔧 DEBUG: Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    res.status(500).json({
      debug: true,
      error: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Update user: http://localhost:${PORT}/api/update-user`);
  
  console.log('\n📚 API Documentation:');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`🌐 Swagger UI:  http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
  console.log('════════════════════════════════════════════════════════════════');
  
  console.log('\n🚀 Available API Endpoints:');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`GET    /api/health                        - Health check`);
  console.log(`GET    /api/test-external                 - Test external API connectivity`);
  console.log(`POST   /api/update-user                   - Update user profile`);
  console.log(`GET    /api/get-user/:displayId           - Get user details`);
  console.log(`POST   /api/get-match-results/            - Get matched jobs`);
  console.log(`POST   /api/get-recommended-match-results/ - Get recommended jobs`);
  console.log(`POST   /api/get-match-statistics/         - Get match statistics`);
  console.log('════════════════════════════════════════════════════════════════');
  
  console.log('\n🌐 External API Configuration:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`Base URL: ${EXTERNAL_API_BASE}`);
  console.log(`Health:   ${EXTERNAL_API_BASE}/health`);
  console.log(`User:     ${EXTERNAL_API_BASE}/get-user-detail/`);
  console.log(`Matches:  ${EXTERNAL_API_BASE}/get-match-results/`);
  console.log(`Recommended: ${EXTERNAL_API_BASE}/get-recommended-match-results/`);
  console.log(`Statistics: ${EXTERNAL_API_BASE}/get-match-statistics/`);
  console.log('────────────────────────────────────────────────────────────────\n');
}); 