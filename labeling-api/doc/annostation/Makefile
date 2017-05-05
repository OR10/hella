TEMPLATE=default

.PHONY: all
all: html/api.html

html/api.html: api.md $(shell find . -name '*.md')
	mkdir -p html
	aglio -t $(TEMPLATE) -i $< -o $@

.PHONY: clean
clean:
	$(RM) -r html

.PHONY: serve
serve: api.md
	aglio -t $(TEMPLATE) -i $< -s -h 0.0.0.0
