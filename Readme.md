```sql
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  isbooked INT DEFAULT 0
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20);

CREATE TABLE users (
id SERIAL PRIMARY KEY  NOT NULL,
first_name varchar(55) NOT NULL,
email varchar(322) UNIQUE NOT NULL,
password varchar(66),
salt text,
created_at timestamp DEFAULT now() NOT NULL,
updated_at timestamp
);
```
