import { useState } from 'react'
import './App.css'
import { Box, CircularProgress, Container, FormControl, Input, InputLabel, MenuItem, Select, TextField, Typography, Button } from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post("http://localhost:8080/api/email/generate",
          {
            emailContent,
            tone
          });
          setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
      }
      catch (error) {
        setError('Failed to generate reply. Please try again.');
        console.error(error);
      } finally {
        setLoading(false);
      }
  };

  return (
    <Container maxWidth="md" sx={{py:4}}>
      <Typography variant='h3' component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{mx:3}}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          label="Original Email Content"
          value={emailContent || ''}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{mb: 2}}
        />

        <FormControl fullWidth sx={{mb: 2}}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone || ''}
            label={"Tone (Optional)"}
            onChange={(e) => setTone(e.target.value)}>
              <MenuItem value="formal">Formal</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
              <MenuItem value="concise">Concise</MenuItem>
              <MenuItem value="detailed">Detailed</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="empathetic">Empathetic</MenuItem>
              <MenuItem value="humorous">Humorous</MenuItem>
              <MenuItem value="assertive">Assertive</MenuItem>
              <MenuItem value="apologetic">Apologetic</MenuItem>
              <MenuItem value="encouraging">Encouraging</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
              <MenuItem value="sympathetic">Sympathetic</MenuItem>
              <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
              <MenuItem value="respectful">Respectful</MenuItem>
              <MenuItem value="supportive">Supportive</MenuItem>
              <MenuItem value="confident">Confident</MenuItem>
              <MenuItem value="optimistic">Optimistic</MenuItem>
              <MenuItem value="inspirational">Inspirational</MenuItem>
              <MenuItem value="sarcastic">Sarcastic</MenuItem>
              <MenuItem value="persuasive">Persuasive</MenuItem>
              <MenuItem value="reassuring">Reassuring</MenuItem>
              <MenuItem value="grateful">Grateful</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleSubmit}
          disabled={!emailContent || loading}
        >
          {loading ? <CircularProgress size={24}/> : "Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{mt: 2}}>
          {error}
        </Typography>
      )}
      {generatedReply && (
        <Box sx={{mt: 3}}>
          <Typography variant="h6" gutterBottom>
            Generated Reply
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant='outlined'
            value={generatedReply || ''}
            InputProps={{
              readOnly: true}}/>
          <Button 
            variant="outlined"
            sx={{mt: 2}}
            onClick={() => navigator.clipboard.writeText(generatedReply)}>
            Copy to Clipboard
          </Button>
        </Box>
      )}

    </Container>
  )
}

export default App
