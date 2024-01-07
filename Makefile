all:	launch

launch:
	docker-compose up --build

stop:
	docker-compose down

clean:
	docker-compose down --rmi all

fclean: clean
	docker system prune --all --force --volumes

re : fclean all

.PHONY: launch update stop clean fclean re
