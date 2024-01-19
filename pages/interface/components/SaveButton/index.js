import { useEffect, useState } from 'react';

import { Box, IconButton, Tooltip } from '@/TabNewsUI';
import { BookmarkIcon, BookmarkSlashIcon } from '@/TabNewsUI/icons';

export default function SaveButton({ content }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    const isContentSaved = savedPosts.some((savedPost) => savedPost.id === content.id);

    setIsSaved(isContentSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.id]);

  const handleSaveButtonClick = () => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    if (isSaved) {
      const updatedSavedPosts = savedPosts.filter((savedPost) => savedPost.id !== content.id);
      localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
    } else {
      const updatedSavedPosts = [{ ...content }, ...savedPosts];
      localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
    }

    setIsSaved(!isSaved);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Tooltip aria-label={isSaved ? 'Remover dos Salvos' : 'Salvar'} direction="ne">
        <IconButton
          variant="invisible"
          aria-label={isSaved ? 'Remover dos Salvos' : 'Salvar'}
          icon={isSaved ? BookmarkSlashIcon : BookmarkIcon}
          size="small"
          sx={{ color: 'fg.subtle', lineHeight: '18px' }}
          onClick={handleSaveButtonClick}
        />
      </Tooltip>
    </Box>
  );
}
