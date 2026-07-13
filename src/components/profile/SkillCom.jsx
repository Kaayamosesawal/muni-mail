import React from 'react';
import Badge from '../common/Badge';

const SkillCom = ({ skill, level }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand/20 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-brand group-hover:scale-150 transition-transform" />
        <span className="text-sm font-bold text-slate-700 font-syne">{skill}</span>
      </div>
      <Badge variant="brand" className="text-[9px]">
        {level || 'Learner'}
      </Badge>
    </div>
  );
};

export default SkillCom;