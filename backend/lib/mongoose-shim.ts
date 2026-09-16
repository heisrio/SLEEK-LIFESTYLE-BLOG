
// Kept as a local import boundary so models can share one backend database client.
// The old browser storage mock made CRUD appear to work without ever reaching MongoDB.
import mongoose from 'mongoose';

export default mongoose;
