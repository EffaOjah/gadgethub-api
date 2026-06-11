import { Request, Response } from 'express';

export const uploadSingle = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  // Cloudinary storage provides the full URL in req.file.path
  const cloudinaryUrl = req.file.path;

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: cloudinaryUrl,
      fullUrl: cloudinaryUrl, // For backwards compatibility if frontend uses fullUrl
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
};
