VERSION := $(shell node -e "console.log(require('./package.json').version)")

.PHONY: default release

# Add a default task so we don't release just because someone ran 'make'
default:
	@echo "Did you mean to release a new version?"
	@echo "If so, run 'make release'."

release:
	@echo "Tagging release $(VERSION)"
	@git tag -m "$(VERSION)" v$(VERSION)

	@echo "Pushing tags to GitHub"
	@git push --tags

	@echo "Done"
	@echo "Don't forget to check the binaries make it to the Github release page and npm publish"