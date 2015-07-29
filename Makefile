default: install

.PHONY: install
install:
	npm install http-proxy --save
	npm install config --save
	npm install properties --save
	npm install tunnel --save
	npm install proxy --save
	npm install debug --save
	npm install node-env-file --save
