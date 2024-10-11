TODO:
- [ ] input sanitation
- [ ] add referal check middleware
- [ ] prevent sql injection
- [ ] generate new keys
- [ ] HTTPS setup
- [ ] AI chat monitoring
- [ ] indexing
- [ ] implement user profile route
- [ ] validation
- [x] password hashing
- [x] migration


# To start the migration process
```bash
 DATABASE_URL=postgres://postgres:root@localhost:5432/roomatlas npm run migrate up
 ```

 # To create migration file
 ```bash
 npm run migrate create <migration_name>
 ```