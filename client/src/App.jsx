import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [fileUrl, setFileUrl] = useState("");
  const [folder, setFolder] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUrlChange = (e) => {
    setFileUrl(e.target.value);
  };

  const handleFolderChange = (e) => {
    setFolder(e.target.value);
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadResult(null);
    //https://s3-uploader.onrender.com
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:3000/upload-from-url",
        {
          fileUrl,
          folder,
        }
      );
      setUploadResult(response.data);
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>S3 Uploader</h1>
        <div className="form-group">
          <label>File URL:</label>
          <input
            type="text"
            value={fileUrl}
            onChange={handleFileUrlChange}
            placeholder="Enter file URL"
          />
        </div>
        <div className="form-group">
          <label>Folder:</label>
          <input
            type="text"
            value={folder}
            onChange={handleFolderChange}
            placeholder="Enter folder name"
          />
        </div>
        <button onClick={handleUpload}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {uploadResult && (
          <div className="result">
            <h2>Upload Result:</h2>
            <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div className="error">
            <h2>Error:</h2>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
