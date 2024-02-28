import { redirect } from 'next/navigation';
import { redirectToSignIn } from '@clerk/nextjs';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';

interface Props {
	params: {
		serverId: string;
		channelId: string;
	};
}

export default async function Page({ params }: Props) {
	const profile = await currentProfile();

	if (!profile) {
		return redirectToSignIn();
	}

	const [channel, member] = await Promise.all([
		db.channel.findUnique({
			where: {
				id: params.channelId,
			},
		}),
		db.member.findFirst({
			where: {
				serverId: params.serverId,
				profileId: profile.id,
			},
		}),
	]);

	if (!channel || !member) {
		redirect('/');
	}

	return (
		<div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
			<ChatHeader
				name={channel.name}
				serverId={channel.serverId}
				type='channel'
			/>

			<ChatMessages
				member={member}
				name={channel.name}
				chatId={channel.id}
				type='channel'
				apiUrl='/api/messages'
				socketUrl='/api/socket/messages'
				socketQuery={{
					channelId: channel.id,
					serverId: channel.serverId,
				}}
				paramKey='channelId'
				paramValue={channel.id}
			/>

			<ChatInput
				name={channel.name}
				type='channel'
				apiUrl='/api/socket/messages'
				query={{
					channelId: channel.id,
					serverId: channel.serverId,
				}}
			/>
		</div>
	);
}
