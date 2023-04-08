import async from './async';
import { CustomRequest } from '../../custom';
import { Response, NextFunction } from 'express';

export async function adminRequireedHandler(requireLevel: number, req: CustomRequest, res: Response, next: NextFunction) {
  if (req.user == null) next('LoginRequired');
  else if (req.user.adminLevel < requireLevel) next('AdminRequired');
  else next();
}

export const adminRequired = (requireLevel: number) =>
  async(async (req: CustomRequest, res: Response, next: NextFunction) => {
    adminRequireedHandler(requireLevel, req, res, next);
  });

export default adminRequired;
