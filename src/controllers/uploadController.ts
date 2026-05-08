import { Request, Response } from 'express';

export const uploadSingle = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  // Return relative path. Frontend will prepend the base URL if needed.
  const relativeUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: relativeUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${relativeUrl}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
};
