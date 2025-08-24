# server/Makefile
.PHONY: run run-prod install debug

APP  ?= app.main:app
HOST ?= 0.0.0.0
PORT ?= 8000
VENV ?= .venv
PY   ?= $(VENV)/bin/python

run:
	$(PY) -m uvicorn $(APP) --host $(HOST) --port $(PORT) --reload  # 변경: activate 없이 venv 파이썬 직접 호출

run-prod:
	$(PY) -m uvicorn $(APP) --host $(HOST) --port $(PORT) --workers 4

install:
	$(PY) -m pip install -r requirements.txt

debug:
	@echo "APP=$(APP)"; echo "VENV=$(VENV)"; echo "PY=$(PY)"
	@$(PY) -V || echo "!! $(PY) not found"
	@$(PY) -c "import importlib; m=importlib.import_module('$(firstword $(subst :, ,$(APP)))'); print('import ok, has app =', hasattr(m,'app'))" || echo "!! import failed"