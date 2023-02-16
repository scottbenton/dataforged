import { DF_KEY, schemaRef } from './common'
import { type JSONSchemaType as Schema } from 'ajv'
import {
	type Attributes,
	type Moves as Types,
	type Localize,
	type Metadata,
	type Players,
	type RulesetClassic,
	type RulesetStarforged,
	type Moves
} from '@base-types'
import { Abstract } from '@schema-json'
import _ from 'lodash'
import { Attribute } from 'base-types/attributes'

export const MoveID: Schema<Types.MoveID> = {
	type: 'string',
	oneOf: [
		{
			title: 'Move ID',
			type: 'string',
			pattern: /^[a-z0-9][a-z0-9_]+\/moves(\/[a-z][a-z_]*[a-z]){2}$/.source,
			examples: ['starforged/moves/adventure/face_danger']
		},
		{
			title: 'Asset move ID',
			type: 'string',
			pattern:
				/^[a-z0-9][a-z0-9_]+\/assets(\/[a-z][a-z_]*[a-z]){2}\/moves\/[a-z][a-z_]*[a-z]$/
					.source,
			examples: ['starforged/assets/module/grappler/moves/ready_grappler']
		}
	]
}

export const MoveCategoryID: Schema<Types.MoveCategoryID> = {
	type: 'string',
	pattern: /^[a-z0-9][a-z0-9_]+\/collections\/moves\/[a-z][a-z_]*[a-z]$/.source,
	examples: ['starforged/collections/moves/adventure']
}

export const MoveCategory: Schema<Types.MoveCategory> =
	Abstract.collectionSchema<Types.MoveCategory>('Move', 'MoveCategoryID')
export const MoveCategoryExtension = Abstract.collectionExtensionSchema(
	'Move',
	'MoveCategoryID'
)

export const MoveOutcomeType: Schema<Types.MoveOutcomeType> = {
	type: 'string',
	enum: ['miss', 'weak_hit', 'strong_hit']
}

const MoveOutcome: Schema<Types.MoveOutcome> = {
	type: 'object',
	required: ['text'],
	additionalProperties: false,
	properties: {
		text: schemaRef<Localize.MarkdownParagraph>('MarkdownParagraph'),
		count_as: schemaRef<Types.MoveOutcomeType>('MoveOutcomeType'),
		reroll: {
			title: 'Move reroll',
			type: 'object',
			required: ['method'],
			nullable: undefined as any,
			properties: {
				text: schemaRef<Localize.MarkdownPhrase>('MarkdownPhrase'),
				method: {
					title: 'Move reroll method',
					type: 'string',
					enum: ['any', 'all', 'challenge_die', 'challenge_dice', 'action_die']
				}
			}
		}
	}
}

const MoveOutcomeMatchable: Schema<Types.MoveOutcomeMatchable> = _.merge(
	{} as Schema<Types.MoveOutcomeMatchable>,
	MoveOutcome,
	{ properties: { match: MoveOutcome } }
)

const MoveOutcomes: Schema<Types.MoveOutcomes> = {
	title: 'Move outcomes',
	type: 'object',
	required: MoveOutcomeType.enum as Types.MoveOutcomeType[],
	properties: {
		miss: MoveOutcomeMatchable,
		weak_hit: MoveOutcome,
		strong_hit: MoveOutcomeMatchable
	}
}

export const RollableStatID: Schema<Types.RollableStatID> = {
	oneOf: [
		schemaRef<Players.StatID>('StatID'),
		schemaRef<Players.ConditionMeterID>('ConditionMeterID'),
		schemaRef<Attributes.AttributeID>('AttributeID'),
		schemaRef<
			RulesetClassic.ConditionMeterAlias | RulesetStarforged.ConditionMeterAlias
		>('ConditionMeterAlias')
	]
}

export const RollType: Schema<Types.RollType> = {
	type: 'string',
	enum: ['action_roll', 'progress_roll']
}

export const RollMethod: Schema<Types.RollMethod> = {
	type: 'string',
	enum: ['any', 'inherit', 'highest', 'lowest', 'all'],

	description:
		"`any`: When rolling with this move trigger option, the user picks which stat to use.\n\n`all`: When rolling with this move trigger option, *every* stat or progress track of the `using` key is rolled.\n\n`highest`: When rolling with this move trigger option, use the highest/best option from the `using` key.\n\n`lowest`: When rolling with this move trigger option, use the lowest/worst option from the `using` key.\n\n`inherit`: This move trigger option has no roll method of its own, and must inherit its roll from another move trigger option. If the parent's `Using` is defined, the inherited roll must use one of those stats/progress tracks."
}

const TriggerOption: Schema<Types.TriggerOption> = {
	title: 'Trigger option',
	type: 'object',
	required: ['roll_type', 'method', 'using'],
	additionalProperties: false,
	properties: {
		text: schemaRef<Localize.MarkdownPhrase>('MarkdownPhrase'),
		roll_type: schemaRef<Types.RollType>('RollType'),
		method: {
			default: 'any',
			description:
				'The method this move trigger uses to select which stat(s) or progress track(s) are rolled. If this is a MoveOutcomeType, then it simply takes that result automatically rather than making a roll.',
			oneOf: [
				schemaRef<Types.RollMethod>('RollMethod'),
				schemaRef<Types.MoveOutcomeType>('MoveOutcomeType')
			]
		},
		using: {
			title: 'Roll using',
			type: 'array',
			items: { type: 'string' },
			description:
				'The stat(s) or progress track(s) that may be rolled with this move trigger option.'
		}
	},
	oneOf: [
		{
			properties: {
				roll_type: { const: 'progress_roll' },
				using: {
					type: 'array',
					items: schemaRef<Types.ProgressType>('ProgressType')
				}
			}
		},
		{
			properties: {
				roll_type: { const: 'action_roll' },
				using: {
					type: 'array',
					items: schemaRef<Types.RollableStatID>('RollableStatID')
				}
			}
		}
	]
}

const Trigger: Schema<Types.Trigger> = {
	title: 'Trigger',
	type: 'object',
	required: ['text'],
	additionalProperties: false,
	properties: {
		text: {
			...schemaRef<Localize.MarkdownPhrase>('MarkdownPhrase'),
			description:
				'A markdown string containing the primary trigger text for this move.\n\nSecondary triggers (for specific stats or uses of an asset ability) are described in `options`.'
		},
		options: {
			type: 'array',
			nullable: true,
			items: TriggerOption
		},
		by: {
			title: 'Triggered by',
			type: 'object',
			description:
				"Information on who can trigger this item. Usually this is just the player, but some asset abilities can trigger from an Ally's move.",
			additionalProperties: false,
			default: { player: true, ally: false },
			required: ['player', 'ally'],
			properties: {
				player: {
					type: 'boolean',
					default: true
				},
				ally: {
					type: 'boolean',
					default: false
				}
			}
		}
	}
}

export const Move: Schema<Types.Move> = {
	type: 'object',
	required: ['_id', 'text', 'name', 'trigger', 'source'],
	additionalProperties: false,
	properties: {
		_id: schemaRef<Moves.MoveID>('MoveID'),
		name: schemaRef<Localize.Label>('Label'),
		trigger: Trigger,
		source: schemaRef<Metadata.Source>('Source'),
		outcomes: MoveOutcomes,
		text: schemaRef<Localize.MarkdownParagraphs>('MarkdownParagraphs'),
		suggestions: schemaRef<Metadata.SuggestionsBase>('Suggestions'),
		progress_move: {
			description:
				'Whether or not the move is a Progress Move. Progress moves roll two challenge dice against a progress score.',
			type: 'boolean',
			default: false,
			nullable: undefined as any
		},
		attributes: {
			type: 'object',
			required: undefined as any,
			patternProperties: {
				[DF_KEY]: schemaRef<Attributes.Attribute>('Attribute')
			},
			nullable: undefined as any
		}
		// tags: {
		// 	description:
		// 		"Arbitrary strings tags that describe optional metadata that doesn't fit in other properties.",
		// 	type: 'array',
		// 	items: {
		// 		type: 'string'
		// 	}
		// },
	},
	oneOf: [
		{
			properties: {
				progress_move: { const: true },
				trigger: {
					type: 'object',
					properties: {
						options: {
							type: 'array',
							items: {
								type: 'object',
								properties: { roll_type: { const: 'progress_roll' } }
							}
						}
					}
				}
			}
		},
		{
			properties: {
				progress_move: { const: false },
				trigger: {
					type: 'object',
					properties: {
						options: {
							type: 'array',
							items: {
								type: 'object',
								properties: { roll_type: { const: 'action_roll' } }
							}
						}
					}
				}
			}
		}
	]
}

export const MoveExtension: Schema<Types.MoveExtension> = {
	required: ['_extends'],
	type: 'object',
	properties: {
		_id: schemaRef<string>('ID'),
		_extends: {
			type: ['array', 'null'],
			items: schemaRef<Types.MoveID>('MoveID')
		},
		progress_move: Move.properties?.progress_move,
		trigger: _(Trigger)
			.omit('required')
			.set(
				'properties.options.items.required',
				(Trigger.properties?.options as any).items.required.filter(
					(item: string) => item !== 'using'
				)
			)
			.value(),
		text: Move.properties?.text,
		outcomes: _.omit(
			MoveOutcomes,
			'required',
			'properties.strong_hit.required',
			'properties.weak_hit.required',
			'properties.miss.required'
		)
	}
}

// TODO
export const CustomStat: Schema<any> = {} as any
