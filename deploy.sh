#!/bin/bash

tar czf backend.tar.gz src .env package.json package-lock.json
scp -i ~/.ssh/Leno-Key_Pair.pem backend.tar.gz ubuntu@lenofx-painel:~/backend
rm backend.tar.gz