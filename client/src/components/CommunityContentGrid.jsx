import React from 'react';
import CommunityContentCard from './CommunityContentCard';

const CommunityContentGrid = ({
  items,
  view,
  expandedCard,
  toggleCardExpand,
  handleShare,
  formatDate,
}) => {
  return (
    <div className="content-grid">
      {items.map((item, index) => (
        <CommunityContentCard
          key={item._id}
          item={item}
          isExpanded={expandedCard === item._id}
          onToggleExpand={toggleCardExpand}
          onShare={handleShare}
          view={view}
          formatDate={formatDate}
          animationDelay={`${index * 0.1}s`}
        />
      ))}
    </div>
  );
};

export default CommunityContentGrid;