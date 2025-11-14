import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeAPI, eligibilityAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  Tag,
  Globe,
} from 'lucide-react';

/**
 * SchemeDetail.jsx
 * - Shows all scheme data (name, ministry, tags, contact, documents, benefits, applicationProcess)
 * - Shows Apply buttons in:
 *    1) primary action area (beside Visit Official Website)
 *    2) eligibility result card (if eligible)
 *    3) footer action area (always visible)
 * - Supports scheme.applyLink (string) or scheme.applyLinks (array of { label, url })
 * - If scheme.status !== 'Active' the Apply button will be disabled and a note shown.
 */

const SchemeDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [checking, setChecking] = useState(false);

  // UI state for multi-link selection
  const [selectedApplyUrl, setSelectedApplyUrl] = useState(null);

  useEffect(() => {
    fetchScheme();
    setEligibility(null);
    setSelectedApplyUrl(null);
  }, [id]);

  const fetchScheme = async () => {
    try {
      const response = await schemeAPI.getById(id);
      const data = response.data;
      setScheme(data);

      // pre-select a URL if available
      if (data?.applyLink) setSelectedApplyUrl(data.applyLink);
      else if (Array.isArray(data?.applyLinks) && data.applyLinks.length > 0) {
        setSelectedApplyUrl(data.applyLinks[0].url);
      }
    } catch (error) {
      console.error('Error fetching scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) {
      alert('Please login to check eligibility');
      return;
    }

    setChecking(true);
    try {
      const response = await eligibilityAPI.check(id);
      setEligibility(response.data.eligibility);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Error checking eligibility. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const openApplyLink = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isActive = (s) => (s?.status ? s.status.toLowerCase() === 'active' : true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Scheme not found</h2>
          <Link to="/schemes" className="text-primary-600 hover:underline">
            Back to Schemes
          </Link>
        </div>
      </div>
    );
  }

  // Build canonical list of apply links (normalize)
  const applyLinks = (() => {
    if (scheme.applyLinks && Array.isArray(scheme.applyLinks) && scheme.applyLinks.length > 0) {
      return scheme.applyLinks;
    }
    if (scheme.applyLink) {
      return [{ label: 'Apply (official)', url: scheme.applyLink }];
    }
    // fallback: use officialWebsite as apply when nothing else is present
    if (scheme.officialWebsite) {
      return [{ label: 'Official Website', url: scheme.officialWebsite }];
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/schemes"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Schemes
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header / meta */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium inline-block">
                  {scheme.category}
                </span>

                {/* tags */}
                <div className="flex items-center space-x-2">
                  {scheme.tags?.slice(0, 6).map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      <Tag className="h-3 w-3 mr-1" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-1 text-gray-900">{scheme.name}</h1>
              <p className="text-gray-600">{scheme.ministry}</p>
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  isActive(scheme) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {scheme.status || 'Unknown'}
              </span>

              {/* small header action area: Apply / Official */}
              <div className="mt-4 flex flex-col items-end gap-2">
                {scheme.officialWebsite && (
                  <a
                    href={scheme.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                )}

                {applyLinks.length > 0 ? (
                  // if multiple, show a compact selector + button; otherwise single apply button
                  applyLinks.length > 1 ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedApplyUrl || ''}
                        onChange={(e) => setSelectedApplyUrl(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                        aria-label="Select apply link"
                      >
                        {applyLinks.map((l, idx) => (
                          <option key={idx} value={l.url}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => openApplyLink(selectedApplyUrl)}
                        disabled={!isActive(scheme) || !selectedApplyUrl}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm text-white transition ${
                          isActive(scheme) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Apply
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openApplyLink(applyLinks[0].url)}
                      disabled={!isActive(scheme)}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm text-white transition ${
                        isActive(scheme) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Apply Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </button>
                  )
                ) : (
                  <div className="text-sm text-gray-500 italic">No direct apply link available</div>
                )}
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            {/* Description */}
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 mb-6">{scheme.description}</p>

            {/* Benefits */}
            <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
            <ul className="list-disc list-inside space-y-2 mb-6">
              {scheme.benefits?.map((benefit, index) => (
                <li key={index} className="text-gray-700">
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Eligibility Criteria */}
            <h2 className="text-2xl font-semibold mb-4">Eligibility Criteria</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheme.eligibilityCriteria?.minAge && (
                  <div>
                    <span className="font-medium">Minimum Age: </span>
                    {scheme.eligibilityCriteria.minAge} years
                  </div>
                )}
                {scheme.eligibilityCriteria?.maxAge && (
                  <div>
                    <span className="font-medium">Maximum Age: </span>
                    {scheme.eligibilityCriteria.maxAge} years
                  </div>
                )}
                {scheme.eligibilityCriteria?.minIncome && (
                  <div>
                    <span className="font-medium">Minimum Income: </span>
                    ₹{scheme.eligibilityCriteria.minIncome.toLocaleString()}
                  </div>
                )}
                {scheme.eligibilityCriteria?.maxIncome && (
                  <div>
                    <span className="font-medium">Maximum Income: </span>
                    ₹{scheme.eligibilityCriteria.maxIncome.toLocaleString()}
                  </div>
                )}
                {scheme.eligibilityCriteria?.gender && (
                  <div>
                    <span className="font-medium">Gender: </span>
                    {scheme.eligibilityCriteria.gender}
                  </div>
                )}
                {scheme.eligibilityCriteria?.categories &&
                  scheme.eligibilityCriteria.categories.length > 0 && (
                    <div>
                      <span className="font-medium">Categories: </span>
                      {scheme.eligibilityCriteria.categories.join(', ')}
                    </div>
                  )}
                {scheme.eligibilityCriteria?.states && scheme.eligibilityCriteria.states.length > 0 && (
                  <div>
                    <span className="font-medium">Available States: </span>
                    {scheme.eligibilityCriteria.states.join(', ')}
                  </div>
                )}
                {scheme.eligibilityCriteria?.occupations &&
                  scheme.eligibilityCriteria.occupations.length > 0 && (
                    <div>
                      <span className="font-medium">Occupations: </span>
                      {scheme.eligibilityCriteria.occupations.join(', ')}
                    </div>
                  )}
                {typeof scheme.eligibilityCriteria?.familySize !== 'undefined' && (
                  <div>
                    <span className="font-medium">Family Size: </span>
                    {scheme.eligibilityCriteria.familySize}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <h2 className="text-2xl font-semibold mb-4">Documents Required</h2>
            <ul className="list-disc list-inside space-y-2 mb-6">
              {scheme.documentsRequired?.map((doc, index) => (
                <li key={index} className="text-gray-700">
                  {doc}
                </li>
              ))}
            </ul>

            {/* Application Process */}
            {scheme.applicationProcess && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Application Process</h2>
                <p className="text-gray-700 mb-6">{scheme.applicationProcess}</p>
              </>
            )}

            {/* Contact Info */}
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3 mb-6">
              {scheme.contactInfo?.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary-600" />
                  <a href={`tel:${scheme.contactInfo.phone}`} className="text-primary-600 hover:underline">
                    {scheme.contactInfo.phone}
                  </a>
                </div>
              )}
              {scheme.contactInfo?.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary-600" />
                  <a href={`mailto:${scheme.contactInfo.email}`} className="text-primary-600 hover:underline">
                    {scheme.contactInfo.email}
                  </a>
                </div>
              )}
              {scheme.contactInfo?.address && (
                <div className="flex items-start">
                  <div className="ml-0">
                    <span className="font-medium">Address: </span>
                    <div className="text-gray-700">{scheme.contactInfo.address}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Apply / Official action area (redundant but useful) */}
            <div className="mb-6 flex flex-wrap gap-3 items-center">
              {scheme.officialWebsite && (
                <a
                  href={scheme.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Visit Official Website
                  <ExternalLink className="h-5 w-5 ml-2" />
                </a>
              )}

              {applyLinks.length > 0 && applyLinks.length === 1 && (
                <button
                  onClick={() => openApplyLink(applyLinks[0].url)}
                  disabled={!isActive(scheme)}
                  className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                    !isActive(scheme) ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  Apply Now
                  <ExternalLink className="h-5 w-5 ml-2" />
                </button>
              )}

              {applyLinks.length > 1 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedApplyUrl || ''}
                    onChange={(e) => setSelectedApplyUrl(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                    aria-label="Select state or portal"
                  >
                    {applyLinks.map((l, idx) => (
                      <option key={idx} value={l.url}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openApplyLink(selectedApplyUrl)}
                    disabled={!isActive(scheme) || !selectedApplyUrl}
                    className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                      !isActive(scheme) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    Apply
                    <ExternalLink className="h-5 w-5 ml-2" />
                  </button>
                </div>
              )}

              {!applyLinks.length && <div className="text-sm text-gray-500 italic">No apply link available</div>}
            </div>
          </div>

          {/* Eligibility Check Section */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Check Your Eligibility</h2>
            {!user ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  Please <Link to="/login" className="underline font-medium">login</Link> to check your eligibility
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={checkEligibility}
                  disabled={checking}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 mb-4"
                >
                  {checking ? 'Checking...' : 'Check Eligibility'}
                </button>

                {eligibility && (
                  <div className={`rounded-lg p-6 ${
                    eligibility.isEligible
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-4">
                      {eligibility.isEligible ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 mr-2" />
                      )}
                      <h3 className={`text-xl font-semibold ${eligibility.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                        {eligibility.isEligible ? 'You are Eligible!' : 'You are Not Eligible'}
                      </h3>
                    </div>

                    <ul className="list-disc list-inside space-y-2">
                      {eligibility.reasons?.map((reason, index) => (
                        <li key={index} className={eligibility.isEligible ? 'text-green-700' : 'text-red-700'}>
                          {reason}
                        </li>
                      ))}
                    </ul>

                    {/* Apply when eligible */}
                    {eligibility.isEligible && applyLinks.length > 0 && (
                      <div className="mt-6">
                        {applyLinks.length === 1 ? (
                          <button
                            onClick={() => openApplyLink(applyLinks[0].url)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                          >
                            Apply Now
                            <ExternalLink className="h-5 w-5 ml-2" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedApplyUrl || ''}
                              onChange={(e) => setSelectedApplyUrl(e.target.value)}
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              {applyLinks.map((l, idx) => (
                                <option key={idx} value={l.url}>{l.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => openApplyLink(selectedApplyUrl)}
                              disabled={!selectedApplyUrl}
                              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                              Apply
                              <ExternalLink className="h-5 w-5 ml-2" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* If eligible but no link */}
                    {eligibility.isEligible && applyLinks.length === 0 && (
                      <div className="mt-4 text-gray-600 italic">
                        You appear eligible — however no apply link is listed for this scheme. Please contact the scheme office or visit the official website.
                      </div>
                    )}

                    {/* If not eligible but link exists, show the link (maybe they can apply for other categories) */}
                    {!eligibility.isEligible && applyLinks.length > 0 && (
                      <div className="mt-6">
                        <div className="text-sm text-gray-700 mb-2">You are currently not eligible, but you can still view the application portal:</div>
                        <div className="flex gap-2">
                          {applyLinks.length === 1 ? (
                            <a
                              href={applyLinks[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-secondary-100 text-gray-800 rounded-lg hover:bg-secondary-200 transition"
                            >
                              View Application Portal
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          ) : (
                            <>
                              <select
                                value={selectedApplyUrl || ''}
                                onChange={(e) => setSelectedApplyUrl(e.target.value)}
                                className="px-3 py-2 border rounded-md text-sm"
                              >
                                {applyLinks.map((l, idx) => (
                                  <option key={idx} value={l.url}>{l.label}</option>
                                ))}
                              </select>
                              <a
                                href={selectedApplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-secondary-100 text-gray-800 rounded-lg hover:bg-secondary-200 transition"
                              >
                                Open Portal
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer action / quick apply summary */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isActive(scheme) ? 'Applications open' : 'Applications currently closed / inactive'}
              </div>

              <div>
                {applyLinks.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {applyLinks.length === 1 ? (
                      <button
                        onClick={() => openApplyLink(applyLinks[0].url)}
                        disabled={!isActive(scheme)}
                        className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                          !isActive(scheme) ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        Apply (Primary)
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </button>
                    ) : (
                      <>
                        <select
                          value={selectedApplyUrl || ''}
                          onChange={(e) => setSelectedApplyUrl(e.target.value)}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          {applyLinks.map((l, idx) => (
                            <option key={idx} value={l.url}>{l.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => openApplyLink(selectedApplyUrl)}
                          disabled={!isActive(scheme) || !selectedApplyUrl}
                          className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                            !isActive(scheme) ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          Apply
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No apply links provided</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetail;
