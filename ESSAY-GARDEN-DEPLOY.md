# Essay Garden Deployment Guide

This guide walks through deploying essay.garden as an independent site.

## Your Essay Garden Details

**Garden Contract:** `0xC65D5dA9c392EF00C53Fe39DE130506760b2B25E`
**Essay Contract:** `0x995274E7B06271bB000F49186A73d4C988E2Bab1`
**Network:** Sepolia Testnet

**View on Factory.garden:**
- Garden: https://factory.garden/0xC65D5dA9c392EF00C53Fe39DE130506760b2B25E
- Essay: https://factory.garden/0xC65D5dA9c392EF00C53Fe39DE130506760b2B25E/essay

## Option 1: Deploy with Netlify UI (Easiest)

### Step 1: Push Changes to GitHub

```bash
git add netlify-essay-garden.toml ESSAY-GARDEN-DEPLOY.md
git commit -m "Add essay.garden Netlify config"
git push origin master
```

### Step 2: Create New Netlify Site

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repo: `lukeweaver-eth/garden-factory-v2`
4. Configure build settings:
   - **Base directory:** (leave empty)
   - **Build command:** `echo 'No build required'`
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
5. Click "Show advanced" → "New variable":
   - Key: `RPC_URL`
   - Value: `https://ethereum-sepolia.publicnode.com`
6. **Important:** Before deploying, go to "Site configuration" → "Build & deploy" → "Build settings"
   - Set **Configuration file path:** `netlify-essay-garden.toml`
7. Click "Deploy site"

### Step 3: Add Custom Domain

1. In your new site's dashboard, go to "Domain management"
2. Click "Add custom domain"
3. Enter: `essay.garden`
4. Click "Verify" (you'll need to prove you own the domain)
5. Netlify will provide DNS instructions

### Step 4: Configure DNS

At your domain registrar (where you bought essay.garden):

**If CNAME is supported for apex domain:**
```
Type: CNAME
Name: @ (or essay.garden)
Value: [your-site-name].netlify.app
TTL: 3600
```

**If CNAME not supported (common for apex domains), use A records:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: A
Name: @
Value: 99.83.190.102

Type: A
Name: @
Value: 145.40.215.102

Type: A
Name: @
Value: 150.230.150.102
```

**Also add www subdomain (optional but recommended):**
```
Type: CNAME
Name: www
Value: [your-site-name].netlify.app
```

### Step 5: Wait for DNS Propagation

DNS changes take 1-48 hours. Check status:
```bash
dig essay.garden
nslookup essay.garden
```

### Step 6: Enable HTTPS

Once DNS is configured:
1. Netlify will automatically provision SSL certificate
2. Wait ~10 minutes for certificate to be issued
3. Enable "Force HTTPS" in Domain settings

---

## Option 2: Deploy with Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### Step 2: Initialize Site

```bash
cd /Users/lukeweaver/Downloads/Garden/GardenFactoryV2

# Create new site
netlify init

# When prompted:
# - "What would you like to do?" → Create & configure a new site
# - "Team" → Select your team
# - "Site name" → essay-garden (or whatever you prefer)
# - "Build command" → echo 'No build required'
# - "Directory to deploy" → .
# - "Netlify functions folder" → netlify/functions
```

### Step 3: Configure Environment Variables

```bash
netlify env:set RPC_URL "https://ethereum-sepolia.publicnode.com"
```

### Step 4: Deploy

```bash
# Deploy using essay garden config
netlify deploy --prod --build --config-path=netlify-essay-garden.toml
```

### Step 5: Add Custom Domain

```bash
netlify domains:add essay.garden
```

Then follow DNS configuration steps from Option 1.

---

## How It Works

Once deployed, essay.garden will:

1. **Root (/)** → Serves your garden contract
   - Netlify redirects to garden function with your contract address
   - Returns HTML with relative URLs

2. **Essay route (/essay)** → Serves your intro essay
   - Netlify redirects to garden function with `/essay` path
   - Returns essay HTML with relative back-links

3. **All links stay on essay.garden**
   - Browser resolves `./essay` to `essay.garden/essay`
   - Browser resolves `./` to `essay.garden`
   - No factory.garden dependencies!

4. **Fallback still works**
   - Factory.garden can still serve at `/0xC65D5d...`
   - Both URLs work independently

---

## Verify Deployment

Test checklist:
- [ ] `essay.garden` loads and shows Essay Garden
- [ ] `essay.garden/essay` loads your intro essay
- [ ] Clicking "introductory essay" link goes to `essay.garden/essay`
- [ ] Clicking garden name in essay goes back to `essay.garden`
- [ ] All links stay within essay.garden domain

---

## Troubleshooting

**"Site not found" error:**
- Check DNS propagation: `dig essay.garden`
- Verify CNAME/A records point to Netlify
- Wait longer (DNS can take 24-48 hours)

**"404 Not Found" on routes:**
- Check that `netlify-essay-garden.toml` is set as config file path
- Verify redirects are configured correctly
- Check Netlify function logs

**Garden loads but essay route fails:**
- Check function logs in Netlify dashboard
- Verify RPC_URL environment variable is set
- Test function locally: `netlify dev`

**SSL certificate not provisioning:**
- Verify DNS is fully propagated first
- Try "Renew certificate" in Domain settings
- Contact Netlify support if stuck

---

## Next Steps

1. **Write your introductory essay:**
   - Go to https://factory.garden/#/essay
   - Select "Essay Garden" from dropdown
   - Write and publish your intro essay

2. **Add sculptures (independent essays):**
   - Deploy essay contracts via factory.garden
   - Add them as sculptures in "manage garden"

3. **Share your garden:**
   - https://essay.garden (custom domain)
   - https://factory.garden/0xC65D5dA9c392EF00C53Fe39DE130506760b2B25E (fallback)
