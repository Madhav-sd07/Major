import express from 'express';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to check eligibility
const checkEligibility = (user, scheme) => {
  const criteria = scheme.eligibilityCriteria;
  const reasons = [];
  let isEligible = true;

  // Age check
  if (user.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    if (criteria.minAge && age < criteria.minAge) {
      isEligible = false;
      reasons.push(`Age requirement not met. Minimum age: ${criteria.minAge} years`);
    }
    if (criteria.maxAge && age > criteria.maxAge) {
      isEligible = false;
      reasons.push(`Age requirement not met. Maximum age: ${criteria.maxAge} years`);
    }
  }

  // Income check
  if (user.income !== undefined) {
    if (criteria.minIncome && user.income < criteria.minIncome) {
      isEligible = false;
      reasons.push(`Income requirement not met. Minimum income: ₹${criteria.minIncome}`);
    }
    if (criteria.maxIncome && user.income > criteria.maxIncome) {
      isEligible = false;
      reasons.push(`Income requirement not met. Maximum income: ₹${criteria.maxIncome}`);
    }
  }

  // Gender check
  if (criteria.gender && criteria.gender !== 'Any' && user.gender !== criteria.gender) {
    isEligible = false;
    reasons.push(`Gender requirement not met. Required: ${criteria.gender}`);
  }

  // Category check
  if (criteria.categories && criteria.categories.length > 0) {
    if (!criteria.categories.includes(user.category)) {
      isEligible = false;
      reasons.push(`Category requirement not met. Required categories: ${criteria.categories.join(', ')}`);
    }
  }

  // State check
  if (criteria.states && criteria.states.length > 0 && user.address?.state) {
    if (!criteria.states.includes(user.address.state)) {
      isEligible = false;
      reasons.push(`State requirement not met. Available in: ${criteria.states.join(', ')}`);
    }
  }

  // Family size check
  if (criteria.familySize && user.familySize) {
    if (user.familySize > criteria.familySize) {
      isEligible = false;
      reasons.push(`Family size requirement not met. Maximum family size: ${criteria.familySize}`);
    }
  }

  // Occupation check
  if (criteria.occupations && criteria.occupations.length > 0 && user.occupation) {
    if (!criteria.occupations.includes(user.occupation)) {
      isEligible = false;
      reasons.push(`Occupation requirement not met. Required occupations: ${criteria.occupations.join(', ')}`);
    }
  }

  if (isEligible && reasons.length === 0) {
    reasons.push('You meet all eligibility criteria for this scheme!');
  }

  return { isEligible, reasons };
};

// @route   POST /api/eligibility/check
// @desc    Check eligibility for a scheme
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const { schemeId, userData } = req.body;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Use provided userData or fetch from authenticated user
    let user;
    if (userData) {
      user = userData;
    } else {
      user = await User.findById(req.user.id);
    }

    const eligibility = checkEligibility(user, scheme);

    // Save eligibility check to user's history
    if (req.user.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          eligibilityChecks: {
            schemeId: scheme._id,
            isEligible: eligibility.isEligible,
            reasons: eligibility.reasons
          }
        }
      });
    }

    res.json({
      scheme: {
        id: scheme._id,
        name: scheme.name,
        category: scheme.category
      },
      eligibility
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/eligibility/check-multiple
// @desc    Check eligibility for multiple schemes
// @access  Private
router.post('/check-multiple', protect, async (req, res) => {
  try {
    const { userData } = req.body;
    const { category, limit = 20 } = req.query;

    let user;
    if (userData) {
      user = userData;
    } else {
      user = await User.findById(req.user.id);
    }

    const query = { status: 'Active' };
    if (category) {
      query.category = category;
    }

    const schemes = await Scheme.find(query).limit(parseInt(limit));

    const results = schemes.map(scheme => {
      const eligibility = checkEligibility(user, scheme);
      return {
        scheme: {
          id: scheme._id,
          name: scheme.name,
          category: scheme.category,
          description: scheme.description
        },
        eligibility
      };
    });

    // Sort by eligibility
    results.sort((a, b) => {
      if (a.eligibility.isEligible && !b.eligibility.isEligible) return -1;
      if (!a.eligibility.isEligible && b.eligibility.isEligible) return 1;
      return 0;
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/eligibility/history
// @desc    Get user's eligibility check history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('eligibilityChecks.schemeId', 'name category description');

    res.json({
      history: user.eligibilityChecks || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

