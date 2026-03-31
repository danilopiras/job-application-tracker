## Backend - Job Application Tracker

### Requisiti

- **Java** 21
- **Maven** 3.9+
- **PostgreSQL** 14+

### Configurazione database

Creare un database locale e un utente dedicato, ad esempio:

- DB: `jobtracker`
- User: `jobtracker`
- Password: `jobtracker`

Modificare se necessario `src/main/resources/application.yml`.

### Avvio in locale

```bash
mvn clean package
mvn spring-boot:run
```

L'applicazione sarà disponibile su `http://localhost:8080`.

### Architettura

- `config` – configurazioni applicative (CORS).
- `controller` – REST controller (`/api/applications`, `/api/interviews`).
- `service` – logica applicativa (JobApplication e Interview).
- `repository` – Spring Data JPA (incluso repository custom per la ricerca filtrata).
- `model.entity` – entità JPA (`JobApplication`, `Interview`).
- `model.dto` – DTO di input/output.
- `mapper` – MapStruct per la conversione tra entity e DTO.
- `exception` – eccezioni custom e global exception handler.
- `client` – predisposto per futuri client HTTP verso altri servizi.
- `security` – predisposto per futura integrazione con Spring Security / JWT.

### Build Docker (backend)

```bash
mvn clean package
docker build -t jobtracker-backend .
```

