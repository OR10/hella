# Repository Splitting Utillity

## Prerequisites

### GNU xargs

The script needs the GNU version of xargs. If you you are using linux you are most likely fine already.

If you are on a macOS System please install findutils via homebrew:

```
brew install findutils
```

To ensure the tool uses the correct xargs executable you need to add the installed package path to your
`PATH` environment variable:

```
PATH="/usr/local/opt/findutils/libexec/gnubin:$PATH"
```

### ripgrep (rg)

The rewriting process utilizes the `ripgrep` (`rg`) utillity.

For macOS it is available within homebrew:

```
brew install rg
```

For linux please consult the package manager of your distribution 
