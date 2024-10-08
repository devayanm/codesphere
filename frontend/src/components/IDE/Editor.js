import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { parseTmTheme } from "monaco-themes";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { AppBar, Toolbar, IconButton, Typography, Select, MenuItem, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import themeIcon from "@mui/icons-material/Brightness4";

const EditorComponent = ({ language, value, onChange, theme, options }) => {
  const editorRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(theme);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const updatedValue = editor.getValue();
      onChange(updatedValue);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      formatCode();
    });
  };

  const formatCode = () => {
    if (!editorRef.current) return;

    const unformattedCode = editorRef.current.getValue();
    const formattedCode = prettier.format(unformattedCode, {
      parser: language === "javascript" ? "babel" : language,
      plugins: [parserBabel],
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
    });

    editorRef.current.setValue(formattedCode);
  };

  const applyTheme = async (themeName, monaco) => {
    try {
      const themeData = await import(`monaco-themes/themes/${themeName}.json`);
      const parsedTheme = parseTmTheme(themeData);

      if (editorRef.current) {
        monaco.editor.defineTheme(themeName, parsedTheme);
        setCurrentTheme(themeName);
        editorRef.current.updateOptions({ theme: themeName });
      }
    } catch (error) {
      console.error(`Failed to load theme ${themeName}`, error);
    }
  };

  useEffect(() => {
    if (theme !== currentTheme) {
      applyTheme(theme);
    }
  }, [theme]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#1e1e1e" }}>
      <AppBar position="static" sx={{ bgcolor: "#333" }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cloidet Editor
          </Typography>
          <Select
            value={currentTheme}
            onChange={(e) => applyTheme(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              color: "#fff",
              bgcolor: "#555",
              marginRight: 2,
              ".MuiOutlinedInput-notchedOutline": { border: 0 },
            }}
          >
            <MenuItem value="vs-dark">Dark Theme</MenuItem>
            <MenuItem value="light">Light Theme</MenuItem>
          </Select>
          <IconButton color="inherit">
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          theme={currentTheme}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            renderWhitespace: "all",
            formatOnType: true,
            formatOnPaste: true,
            folding: true,
            renderLineHighlight: "all",
            tabSize: 2,
            bracketPairColorization: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            ...options,
          }}
          onMount={handleEditorDidMount}
        />
      </Box>
    </Box>
  );
};

EditorComponent.propTypes = {
  language: PropTypes.oneOf([
    "javascript",
    "typescript",
    "html",
    "css",
    "python",
    "java",
    "json",
    "markdown",
  ]).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  theme: PropTypes.string,
  options: PropTypes.object,
};

EditorComponent.defaultProps = {
  theme: "vs-dark",
  options: {},
};

export default EditorComponent;
