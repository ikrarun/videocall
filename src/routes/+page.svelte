<script lang="ts">
	// @ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import BsKeyboard from 'svelte-icons-pack/bs/BsKeyboard';
	import type { PageData } from './$types.js';
	export let data: PageData;
	import logo from '$lib/images/logo.svg';

	console.log(data)

	import { getNotificationsContext } from 'svelte-notifications';

	const { addNotification } = getNotificationsContext();

	let meetingID: string;
	import { goto } from '$app/navigation';

	let JoinCall = async () => {
		if (meetingID) {
			goto(`/room?roomID=${meetingID}`);
		} else {
			addNotification({
				text: 'No Room ID Provided',
				position: 'bottom-left'
			});
		}
	};

</script>

<main class="w-full flex gap-4 h-screen items-center justify-center flex-col">
	<div
		class="w-full h-full items-center justify-center
	 flex flex-col-reverse sm:grid sm:grid-cols-2"
	>
		<div class="w-full px-10 select-none h-fit sm:h-full flex flex-col sm:items-start justify-center">
			<h1 class="text-6xl">Meet Now</h1>
			<h1 class="text-base text-gray-600">
				Peer 2 Peer Video Calls! Free, Secure, and Open-Source Meetup Solution! Connect,
				Collaborate, and Create Together, the FOSS Way!
			</h1>

			<div class="mt-4 inline-flex gap-2">
				<button
					class="p-[0.6rem] bg-blue-700 rounded-sm text-white"
					on:click|preventDefault={() => {
						goto(`/room?roomID=${data.newUuid}`);
					}}>Create Call</button
				>

				<div
					class="rounded-sm inline-flex items-center justify-center gap-1 p-2 border border-gray-600"
				>
					<div class="text-2xl text-gray-700 pb-1">
						<Icon src={BsKeyboard} />
					</div>
					<div>
						<label for="meetingID" />
						<input
							id="meetingID"
							bind:value={meetingID}
							placeholder="Enter Meet Code"
							class="outline-none text-sm placeholder:text-gray-500 ring-0"
							type="text"
						/>
					</div>
				</div>
				<button
					class={meetingID ? 'text-blue-700' : 'hidden'}
					on:click|preventDefault={() => {
						JoinCall();
					}}>Join Now</button
				>
			</div>
		</div>

		<div class="flex flex-col h-1/2 pl-6 sm:p-0 sm:h-full items-start justify-end sm:items-center">
			<img src={logo} class="w-1/2 aspect-square" alt="" />
		</div>
	</div>
</main>

<svelte:head>
	<title>Video Call</title>
	<meta name="description" content="FOSS: Video Calling app built using webrtc." />
</svelte:head>
