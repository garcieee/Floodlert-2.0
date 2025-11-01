floodlert-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           └── predict.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── unet.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── prediction.py
│   │   └── services/
│   │       ├── __init__.py
│   │       └── flood_model.py
│   ├── data/
│   │   ├── terrain_data.tif
│   │   └── flood_model.pth
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py
│   ├── .gitignore
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │   └── favicon.ico
    ├── src/
    │   ├── api/
    │   │   └── floodApi.ts
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   ├── Map.tsx
    │   │   ├── Legend.tsx
    │   │   └── ControlPanel.tsx
    │   ├── hooks/
    │   │   └── useFloodPrediction.ts
    │   ├── styles/
    │   │   └── index.css
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── vite-env.d.ts
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
