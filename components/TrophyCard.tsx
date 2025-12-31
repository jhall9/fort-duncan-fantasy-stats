"use client"

import React, { useState } from 'react'
import { LeagueChampion } from '@/lib/data'

const cardClass = "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-lg"

type Props = {
    champion: LeagueChampion
    defaultOpen?: boolean
}

export default function TrophyCard({ champion, defaultOpen = false }: Props) {
    const [open, setOpen] = useState<boolean>(defaultOpen)

    return (
        <div className={`rounded-lg p-6 transition-all duration-200 ${cardClass}`}>
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    aria-expanded={open}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-900/5 dark:hover:bg-dark-border/20 rounded-md p-1 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{'🏆'}</div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{champion.year} Champion</h3>
                            <div className="mt-1">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{champion.ownerName}</h4>
                                <p className="text-lg text-gray-700 dark:text-gray-300">{champion.teamName}</p>
                            </div>
                        </div>
                    </div>
                </button>
                <div className="ml-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen(prev => !prev)}
                        aria-expanded={open}
                        aria-label={open ? 'Collapse details' : 'Expand details'}
                        className={`p-2 rounded-md text-gray-600 hover:bg-gray-900/5 dark:text-gray-300 dark:hover:bg-dark-border/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transform transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.12 1.02l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Details: animated expand/collapse */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Record</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {champion.record.wins}-{champion.record.losses}
                                {champion.record.ties > 0 && `-${champion.record.ties}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {((champion.record.wins / (champion.record.wins + champion.record.losses + champion.record.ties)) * 100).toFixed(1)}% Win Rate
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Point Differential</div>
                            <div className={`text-lg font-bold ${(champion.pointsFor - champion.pointsAgainst) > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {(champion.pointsFor - champion.pointsAgainst) > 0 ? '+' : ''}
                                {(champion.pointsFor - champion.pointsAgainst).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {((champion.pointsFor - champion.pointsAgainst) / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Points For</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {champion.pointsFor.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(champion.pointsFor / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Points Against</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {champion.pointsAgainst.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(champion.pointsAgainst / (champion.record.wins + champion.record.losses + champion.record.ties)).toFixed(2)} ppg
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
