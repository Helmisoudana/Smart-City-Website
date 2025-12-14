# 🌍 Smart City Platform – Frontend

Plateforme web de **gestion intelligente d'une ville (Smart City)** permettant de visualiser, gérer et analyser les **capteurs IoT**, les **interventions**, les **mesures environnementales**, les **propriétaires**, les **techniciens** et les **arrondissements**.

Ce projet représente la **partie frontend** de la plateforme Smart City et communique avec un **backend API développé avec FastAPI**.

## 🚀 Technologies utilisées

- **Next.js 14** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **Shadcn/UI**
- **Framer Motion**
- **Recharts** (visualisation des données)
- **Axios** (communication API)
- **Postman** (tests API)

## 📁 Structure du projet
```bash
smart-city-frontend/
│
├── app/
│ ├── dashboard/ # Tableau de bord
│ ├── capteurs/ # Gestion des capteurs
│ ├── interventions/ # Interventions techniques
│ ├── mesures/ # Mesures environnementales
│ ├── proprietaires/ # Propriétaires
│ ├── techniciens/ # Techniciens
│ └── arrondissements/ # Arrondissements
│
├── components/ # Composants réutilisables (UI, charts, dialogs)
├── hooks/ # Hooks personnalisés
├── lib/ # Configuration API (Axios)
├── types/ # Interfaces TypeScript
├── public/ # Assets statiques
└── README.md

```

## ⚙️ Installation et lancement

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/TON_USERNAME/smart-city-frontend.git
cd smart-city-frontend
```
2️⃣ Installer les dépendances
```bash
npm install
ou avec Yarn :
```
```bash
yarn install
3️⃣ Lancer le serveur de développement
```
```bash
npm run dev
```
📍 Le site sera accessible sur : http://localhost:3000

🔗 Configuration de l'API Backend
Le frontend communique avec un backend FastAPI.

Fichier : `lib/api.ts`

```typescript
import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
})

export default api
```
⚠️ Important : Assure-toi que le backend FastAPI est bien lancé avant d'exécuter le frontend.

### 🧭 Pages et fonctionnalités
# 🏠 Dashboard
- Vue globale de la ville

- Statistiques générales

- Graphiques dynamiques (Recharts)

- Animations fluides (Framer Motion)

# 📡 Capteurs
- Liste des capteurs IoT

- Ajout et suppression de capteurs

- Filtrage par arrondissement

- Statut : actif, inactif, maintenance

- Association à un propriétaire et un arrondissement

# 🛠️ Interventions
- Historique des interventions techniques

- Visualisation des coûts et durées

- Graphiques temporels

- Validation par intelligence artificielle

- Association aux capteurs et techniciens

# 📊 Mesures
- Mesures environnementales : Température, 
- Pollution, Bruit, etc.

- Visualisation par type et période

- Association à un capteur

- Données historiques ou quasi temps réel

# 👤 Propriétaires
- Gestion des propriétaires de capteurs

- Informations : Nom, Type, Adresse, Téléphone, Email

- Sélection dynamique dans les formulaires

# 👷 Techniciens
- Liste des techniciens

- Certification

- Interventions effectuées et validées

# 🏙️ Arrondissements
- Gestion des zones de la ville

- Filtrage global des données par arrondissement

# 📈 Visualisation des données
- Graphiques en ligne (LineChart)

- Axes intelligents basés sur la date

- Tooltips personnalisés

- Gestion des grandes quantités de données : Slice, Regroupement, Scroll horizontal

# 🔐 Sécurité & bonnes pratiques
- Séparation claire frontend / backend

- Typage strict avec TypeScript

- Composants réutilisables

- Gestion centralisée des erreurs API

- Interface responsive (mobile / desktop)

# 🧪 Tests API
Les routes backend sont testées avec Postman, notamment :

```bash
POST   /capteurs
GET    /interventions
POST   /mesures
GET    /zones-plus-polluees
GET    /arrondissements
```
# 👨‍💻 Auteur
Helmi Soudana

🎓 Élève ingénieur en informatique

🏫 École Nationale des Ingénieurs de Sousse (ENISo)

# 💡 Centres d'intérêt
- Systèmes embarqués

- Internet des Objets (IoT)

- Intelligence artificielle

- Développement web & mobile

# 📜 Licence

Ce projet est réalisé dans un cadre académique et pédagogique.
Libre d'utilisation à des fins éducatives et non commerciales.