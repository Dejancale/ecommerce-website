# 🚀 Production Deployment Guide

## Prerequisites
- Node.js and npm installed
- A production server (VPS, cloud hosting, etc.)
- Domain name (optional but recommended)
- Email service (Gmail, SendGrid, Mailgun, etc.)

## 📧 Email Configuration

### Option 1: Gmail (Easiest for Testing)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security > 2-Step Verification > App passwords
   - Select "Mail" and "Other" (custom name)
   - Copy the generated 16-character password
4. Update `.env` file:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env` file:
   ```
   EMAIL_SERVICE=SendGrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: Mailgun
1. Sign up at https://www.mailgun.com
2. Get SMTP credentials
3. Update `.env` file accordingly

## 🔧 Server Configuration

### 1. Environment Variables
Create/update `server/.env` file:
```env
# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# URLs
FRONTEND_URL=https://your-domain.com
ADMIN_EMAIL=your-admin-email@gmail.com
```

**IMPORTANT**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Build Frontend for Production
```bash
cd client
npm run build
```
This creates an optimized production build in `client/dist/`

## 🌐 Deployment Options

### Option A: Same Server (Backend serves Frontend)

1. **Move build files to server:**
   ```bash
   cp -r client/dist/* server/public/
   ```

2. **Update server CORS (server.js):**
   ```javascript
   app.use(cors({
       origin: process.env.FRONTEND_URL || 'https://your-domain.com',
       credentials: true
   }));
   ```

3. **Serve static files (already configured in server.js):**
   ```javascript
   app.use(express.static('public'));
   ```

4. **Start server:**
   ```bash
   cd server
   npm start
   ```

5. **Use PM2 for production (keeps server running):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ecommerce-server"
   pm2 save
   pm2 startup
   ```

### Option B: Separate Hosting (Vercel + Railway)

#### Frontend on Vercel:
1. Push code to GitHub
2. Import project on Vercel
3. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `client`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.com`

#### Backend on Railway:
1. Create new project on Railway
2. Connect GitHub repository
3. Set root directory to `server`
4. Add environment variables (all from .env)
5. Deploy

#### Update API URLs:
In client code, update all `http://localhost:3000` to your backend URL.

### Option C: Docker Deployment

Create `Dockerfile` in root:
```dockerfile
# Multi-stage build
FROM node:18 AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18 AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./
COPY --from=frontend /app/client/dist ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t ecommerce-app .
docker run -p 3000:3000 --env-file server/.env ecommerce-app
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (use Let's Encrypt/Certbot)
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Add rate limiting (install `express-rate-limit`)
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated
- [ ] Set secure CORS origins
- [ ] Use helmet.js for security headers:
  ```bash
  npm install helmet
  ```
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

## 📊 Database in Production

### Migrate from SQLite to PostgreSQL (Recommended for production):

1. **Install PostgreSQL:**
   ```bash
   npm install pg
   ```

2. **Update database connection:**
   ```javascript
   // Replace sqlite3 code with:
   const { Pool } = require('pg');
   const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: { rejectUnauthorized: false }
   });
   ```

3. **Or keep SQLite:**
   - Ensure database file is backed up regularly
   - Set file permissions: `chmod 600 ecommerce.db`
   - Consider mounting to persistent volume if using containers

## 🧪 Testing Before Launch

1. **Test email functionality:**
   - Register new account
   - Check verification email
   - Test password reset
   - Place test order
   - Update order status (check customer email)

2. **Test all features:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Checkout process
   - Order history
   - Admin panel (all features)

3. **Load testing:**
   ```bash
   npm install -g artillery
   artillery quick --count 10 --num 20 https://your-domain.com
   ```

## 📈 Monitoring

1. **PM2 Monitoring:**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Set up logging:**
   ```bash
   npm install winston
   ```

3. **Error tracking:**
   - Sentry (https://sentry.io)
   - LogRocket (https://logrocket.com)

## 🔄 Continuous Deployment

### GitHub Actions Example:
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull
            cd client && npm install && npm run build
            cd ../server && npm install
            pm2 restart ecommerce-server
```

## 🌟 Performance Optimization

1. **Enable gzip compression:**
   ```bash
   npm install compression
   ```
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add caching headers**

3. **Use CDN for static assets**

4. **Optimize images** (use WebP format)

5. **Enable HTTP/2**

## 📞 Support & Maintenance

- Regularly backup database
- Monitor server logs
- Update dependencies monthly
- Check for security vulnerabilities: `npm audit`
- Monitor email delivery rates
- Track user analytics

## 🎉 Launch Checklist

- [ ] All environment variables set
- [ ] Email sending working
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] PM2 or equivalent running
- [ ] All features tested
- [ ] Admin account created
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] Documentation updated

---

Need help? Check logs with `pm2 logs` or review console output for errors.
