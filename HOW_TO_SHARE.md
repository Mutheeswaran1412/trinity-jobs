# 📧 How to Share Resume Builder Module

## ❌ Problem: Gmail blocks folders and .zip files

## ✅ Solutions:

### Option 1: Upload to Cloud Storage (RECOMMENDED)
1. **Google Drive**
   - Upload `resume-builder-module` folder
   - Right-click → Share → Get link
   - Set to "Anyone with the link"
   - Share the link via email

2. **Dropbox**
   - Upload folder
   - Create shareable link
   - Send link

3. **OneDrive**
   - Upload folder
   - Share → Copy link
   - Send link

### Option 2: GitHub Repository
```bash
# Create new repo
git init
git add .
git commit -m "Resume builder module"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Share repo link
https://github.com/yourusername/resume-builder-module
```

### Option 3: Rename Extension
```bash
# Rename .tar.gz to .txt (Gmail won't block)
mv resume-builder-module.tar.gz resume-builder-module.tar.gz.txt

# Recipient renames back
mv resume-builder-module.tar.gz.txt resume-builder-module.tar.gz
tar -xzf resume-builder-module.tar.gz
```

### Option 4: Split into Parts
```bash
# Split large file
split -b 10M resume-builder-module.tar.gz part_

# Send part_aa, part_ab, part_ac separately

# Recipient combines
cat part_* > resume-builder-module.tar.gz
tar -xzf resume-builder-module.tar.gz
```

### Option 5: Use File Transfer Services
- **WeTransfer** - wetransfer.com (Free up to 2GB)
- **Send Anywhere** - send-anywhere.com
- **Firefox Send** - send.firefox.com

---

## 🎯 BEST METHOD: Google Drive

### Steps:
1. Open Google Drive
2. Click "New" → "Folder upload"
3. Select `resume-builder-module` folder
4. Right-click uploaded folder → "Share"
5. Click "Change to anyone with the link"
6. Copy link
7. Send link via Gmail ✅

---

## 📦 Files Created:
- `resume-builder-module/` - Full module folder
- `resume-builder-module.tar.gz` - Compressed archive

---

## 💡 Quick Share Command:
```bash
# Upload to your preferred service
# Then share the download link
```

**Recommended: Use Google Drive for easy sharing! 🚀**
