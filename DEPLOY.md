# 🚀 Vercel Deployment Guide

## Step 1: Backend Deploy

1. **Vercel pe jao** → New Project → Import karo `backend` folder
2. **Root Directory** set karo: `backend`
3. **Environment Variables** add karo:
   ```
   MONGO_URI        = mongodb+srv://zubaircoderx_db_user:2391526595@cluster0.1tl3dh6.mongodb.net/dash?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET       = heehhhehe66ehehe
   JWT_EXPIRE       = 30d
   NODE_ENV         = production
   CLIENT_URL       = (frontend URL - baad mein update karna)
   ```
4. Deploy karo → URL note karo e.g. `https://devops-backend-xxx.vercel.app`

---

## Step 2: Frontend Deploy

1. **Vercel pe jao** → New Project → Import karo `frontend` folder
2. **Root Directory** set karo: `frontend`
3. **Environment Variables** add karo:
   ```
   REACT_APP_API_URL = https://devops-backend-xxx.vercel.app
   ```
   (Step 1 ka backend URL yahan lagao)
4. Deploy karo → Frontend URL milega

---

## Step 3: Backend mein CLIENT_URL update karo

1. Backend project → Settings → Environment Variables
2. `CLIENT_URL` update karo frontend URL se
3. Redeploy karo backend

---

## Login Credentials (Demo)
- Email: `ahmad@devops.pk`
- Password: `password123`
