import React from 'react';
import TeamMembersCard from '../../../../components/TeamMembersCard';
import { connect } from 'react-redux';

function TeamMembers(props) {
    const { org } = props;
    console.log(org)
    return (
        <div>
            <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 max-md:grid-cols-2 gap-6 max-lg:text-center">
                {org &&
                    org.members &&
                    org.members.length &&
                    org.members
                      .filter((val) => val.is_active === 1)
                      .map((member) => (
                    <TeamMembersCard
                        membername={member.member_name} key={member.id}
                    />
                ))}
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
      org: state.org,
    };
};
  
export default connect(mapStateToProps)(TeamMembers);