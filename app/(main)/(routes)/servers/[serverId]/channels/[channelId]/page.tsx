import { redirect } from 'next/navigation';
import { redirectToSignIn } from '@clerk/nextjs';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';

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

			<div className='flex-1'>Future messages</div>

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
