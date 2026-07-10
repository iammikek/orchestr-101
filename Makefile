.PHONY: test serve migrate docker-up docker-down

test:
	npm run test:run

serve:
	APP_PORT=8005 APP_HOST=127.0.0.1 node public/index.js

migrate:
	node bootstrap/cli.js migrate

docker-up:
	docker compose up --build

docker-down:
	docker compose down
