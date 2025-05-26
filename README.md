# Quantum-Secure: A secure messeging app

## Branching Strategy

1. ### Main Branch
- frontend: all frontend branches should be created from this
- backend : all backend branches should be create from this
- main: frontend and backend is merged here

2. ### Create Branch
- frontend/<feature-name>
  - merge to frontend
- backend/<feature-name>
  - merge to backend


## Run app 
### Frontend
```bash
  npm i
  npm run dev
```

### Backend
```bash
  pip install -r requirements.txt
  uvicorn main:app --reload
```
