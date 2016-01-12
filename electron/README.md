# Electron AnnoStation Package

This directory contains an electron container, which loads a configured domain,
where the AnnoStation application server can be reached.

It is buildable for OSX, Windows and Linux.

## Prerequisites

To be able to run the container a simple `npm install && jspm install` will
suffice

In order to build the necessary containers an installation of `wine` is needed.
It can be easily installed on osx using homebrew:

```bash
brew install wine
```

## Running

The container can be run in development mode issuing `npm start`

## Packaging

Packaging can be triggered using the following commands:

- `npm run package` - Create all packages
- `npm run package:win` - Create only windows packages
- `npm run package:osx` - Create only osx packages
- `npm run packages:linux` - Create only linux packages

The packages will be written to the `Packages` directory

32-bit and 64-bit versions will be created for each operating system

The packaging process takes quite some time. This is caused due to the fact,
that Babel and all libraries are put inside the package currently without
precompiling the project first. Furthermore this creates quite "big" (around
300mbs) packaged applications.
