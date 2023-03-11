import React from 'react';
import propTypes from "prop-types";

function TeamMembersCard({membername}) {
    return (
        <div>
            <div className='p-6 welcome-card rounded-lg'>
                    <h1 className='font-bold text-xl mb-3 truncate text-gray-900 text-start'>
                       {membername}
                    </h1>
                    <div className='flex gap-3'>
                        <a
                            href="https://twitter.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="text-pink-500 icon icon-tabler icon-tabler-brand-twitter" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c0 -.249 1.51 -2.772 1.818 -4.013z"></path>
                                </svg>
                            </div>
                        </a>
                        <a
                            href="https://desktop.telegram.org/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="text-pink-500 icon icon-tabler icon-tabler-brand-telegram" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path>
                                </svg>
                            </div>
                        </a>
                        <a
                            href="https://mail.google.com/mail"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="text-pink-500 icon icon-tabler icon-tabler-mail" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                                    <path d="M3 7l9 6l9 -6"></path>
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
        </div>
    );
}

TeamMembersCard.propTypes = {
    membername: propTypes.string,
}


export default TeamMembersCard;