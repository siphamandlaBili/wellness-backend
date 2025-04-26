import { Event } from '../models/eventModel.js';

export const checkNurseAssignment = async (req, res, next) => {
    try {
        // Safely get eventId from params or body
        const eventId = req.params.eventId || (req.body ? req.body.eventId : undefined);

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.assignedNurse.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not assigned to this event'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

