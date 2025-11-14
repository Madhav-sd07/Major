import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

/**
 * Simple SchemeCard:
 * - Shows scheme info on left
 * - ALWAYS shows Apply button on the right (uses applyLink or officialWebsite fallback)
 * - Opens link in new tab
 */
const SchemeCard = ({ scheme }) => {
  const s = scheme || {};

  // Determine primary apply URL (fallback order)
  const applyUrl =
    (typeof s.applyLink === 'string' && s.applyLink.trim()) ||
    (typeof s.officialWebsite === 'string' && s.officialWebsite.trim()) ||
    // last fallback: if seed used placeholder slug urls, they still exist in applyLink; this handles extremely defensive case:
    (s.links && s.links.apply ? s.links.apply : '') ||
    '';

  const openApply = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
            {s.category || 'Other'}
          </span>

          {s.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {s.tags.slice(0, 4).map((t, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 truncate">{s.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{s.ministry}</p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.description}</p>
      </div>

      {/* Right: actions (Apply) - always visible on the right */}
      <div className="flex-shrink-0 w-full md:w-auto flex items-center justify-end gap-3">
        {/* If there's no link, still show small fallback button that opens new tab to official site if available */}
        {applyUrl ? (
          <button
            onClick={() => openApply(applyUrl)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            title="Open application portal (opens new tab)"
          >
            Apply Now
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <div className="text-sm text-gray-500 italic">No apply link</div>
        )}

        {/* small details link */}
        <Link
          to={`/schemes/${s._id || s.id}`}
          className="text-sm text-primary-600 hover:underline ml-2"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default SchemeCard;
