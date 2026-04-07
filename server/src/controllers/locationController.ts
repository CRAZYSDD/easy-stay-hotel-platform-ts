import { reverseGeocodeLocation } from '../services/locationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import { locationSchema } from '../utils/validators.js';

export const reverseGeocodeController = asyncHandler(async (req, res) => {
  const query = locationSchema.parse(req.query);
  res.json(success(await reverseGeocodeLocation(query.latitude, query.longitude)));
});
