# Intelli-Transport

## 🚀 AI-Based Solutions for Transportation Systems
**Hackathon: PRE TECH NOVA**  
**Team:** Lorem Ipsum  
**Domain:** AI-Based Solutions for Transportation Systems  
**Team Members:** Aryan Randeriya, Dhruv Maradiya

---

## 📌 Project Overview
**Intelli-Transport** is an AI-powered solution that enhances transportation systems through predictive analytics and real-time monitoring. It tackles issues such as traffic congestion, unreliable public transport schedules, driver fatigue, and accident detection using machine learning models.

### 🔥 Key Features
- **Traffic Prediction:** Predicts future traffic congestion using GRU-based machine learning models.
- **Driver Alertness Monitoring:** Detects driver fatigue and distractions through a ResNet-34 model and alerts the driver.
- **Accident Detection:** Identify road accidents in real-time and notify emergency services.
- **Bus Scheduling Optimization:** Dynamically adjusts public transport schedules to avoid high-traffic areas and reduce delays.

---

## Screenshots 
![IMG-20250301-WA0013](https://github.com/user-attachments/assets/34bab08f-4dcb-4352-ac9a-f42fa5f5d20d)
![IMG-20250301-WA0014](https://github.com/user-attachments/assets/156d477f-5def-4a71-bd98-73b7675b3d1f)
![IMG-20250301-WA0011](https://github.com/user-attachments/assets/8a45b44d-0915-4a4a-b084-eec134941dc7)
![IMG-20250301-WA0010](https://github.com/user-attachments/assets/cc6d7526-c571-4c66-a9ec-7a59c2e7d1aa)
![IMG-20250301-WA0009](https://github.com/user-attachments/assets/3ebe7153-c7df-489f-bba4-06007364f4fb)
![IMG-20250301-WA0015](https://github.com/user-attachments/assets/1edd581f-5ff2-4130-bc1f-2e0fe1f985e1)
![IMG-20250301-WA0012](https://github.com/user-attachments/assets/f7eb37ed-d724-4a62-bb73-4c113f14707d)


---

## 💡 Problem Statement
1. **Lack of Future Traffic Prediction:** Current navigation systems only provide real-time traffic data, making it difficult to plan trips in advance.
2. **Inefficient Public Transportation Schedules:** Without predictive analytics, buses often get stuck in traffic, leading to delays and inefficiencies.
3. **Driver Fatigue & Distraction:** Many accidents occur due to drowsy or distracted drivers, which current systems fail to monitor in real-time.
4. **Delayed Accident Response:** Manually reporting accidents delays emergency response times, resulting in greater risks.

---

## 🛠️ Solution Architecture
### 🔍 How It Works
#### **1️⃣ Traffic Prediction Module**
- **Input:** User-provided route, travel date, and time.
- **Processing:** GRU-based model analyzes historical and contextual data.
- **Output:** Predicts traffic levels (light, moderate, heavy) and suggests optimal travel times/routes.

#### **2️⃣ Driver Alertness Monitoring**
- **Input:** Live video feed from an in-vehicle camera.
- **Processing:** ResNet-34 detects fatigue, distraction, or phone usage.
- **Response:** Alerts the driver and logs events for fleet management.

#### **3️⃣ Accident Detection**
- **Input:** Roadside surveillance camera footage.
- **Processing:** CNN-based model identifies sudden motion changes or impact events.
- **Response:** Notifies emergency services with images/videos for rapid assistance.

#### **4️⃣ Bus Scheduling Optimization**
- **Input:** Traffic predictions and live traffic updates.
- **Processing:** Uses AI to dynamically adjust bus schedules and routes.
- **Output:** Improves punctuality, reduces crowding, and optimizes fuel efficiency.

---

## 🏗️ Tech Stack
### **Backend:**  
- Python
- FastAPI

### **Frontend:**  
- Next.js
- TypeScript

### **Machine Learning Frameworks:**  
- PyTorch
- TensorFlow
- Scikit-Learn
- Fast.ai
- Pandas

### **Cloud Infrastructure:**  
- AWS
- Render
- Vercel

---

## 📊 Impact
### **🎯 Target Audience:**
- Daily commuters using public or private transportation.
- Public transportation authorities optimizing schedules.
- Government agencies improving road safety and congestion.
- Logistics and fleet operators monitoring driver safety.

### **🌍 Social Impact:**
- Helps commuters plan efficient trips and avoid delays.
- Enhances public transportation reliability.

### **💰 Economic Impact:**
- Reduces fuel consumption and transportation costs.
- Lowers accident-related economic losses.

### **🔬 Technological Impact:**
- Advances AI-driven intelligent traffic management.
- Sets a precedent for smart city transportation solutions.

---

## 📈 Scalability & Future Enhancements
### **🌍 Scalability:**
- **Public Transport Systems:** Implement in city bus networks (e.g., AMTS, BRTS).
- **Navigation Integration:** Incorporate with Google Maps for enhanced trip planning.
- **Government Use:** Assist traffic departments in identifying accident-prone areas.
- **Fleet Management:** Help logistics companies improve safety and efficiency.

### **🔮 Future Enhancements:**
- Integrate real-time weather, roadwork, and event data to improve traffic predictions.
- Upgrade accident detection to assess severity and predict high-risk zones.
- Develop a multilingual UI for broader accessibility.
- Provide real-time driver assistance like suggesting rest stops.
- Integrate with smart city infrastructure, including traffic lights and parking systems.

### **🚀 Potential Extensions:**
- **Public Transport Optimization:** Extend AI scheduling to metros and trams.
- **Ride-Sharing Integration:** Optimize ride-sharing routes.
- **Emergency Services Assistance:** Provide emergency teams with the fastest routes to accident sites.
- **Environmental Monitoring:** Track vehicular emissions based on traffic data.
- **Logistics Efficiency:** Optimize last-mile delivery routes for reduced delays.

---

## 🔧 Installation & Setup
### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB Atlas (or local MongoDB instance)

### Clone the Repository
```bash
git clone https://github.com/your-repo/intelli-transport.git
cd intelli-transport
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 Contributors
- **Aryan Randeriya** - [GitHub](https://github.com/aryanranderiya)
- **Dhruv Maradiya** - [GitHub](https://github.com/Dhruv-Maradiya)


---

## 📬 Contact
For any queries or collaborations, feel free to reach out:
📧 **Email:** a@aryanranderiya.com
💼 **LinkedIn:** [Aryan Randeriyha](https://linkedin.com/in/aryanranderiya)

---


If you find this project useful, consider giving it a ⭐ on GitHub!
