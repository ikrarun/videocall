<script lang="ts">
	import Share from '$lib/base/share.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_APPID } from '$env/static/public';
	import toast, { Toaster } from 'svelte-french-toast';

	import Icon from '@iconify/svelte';

	let cam: boolean = true;
	let audio: boolean = true;

	import AgoraRTM, { type RtmChannel, type RtmClient } from 'agora-rtm-sdk';
	import { onDestroy, onMount } from 'svelte';

	let APP_ID = PUBLIC_APPID;

	var localStream: MediaStream;
	var remoteStream: MediaStream | null;

	let localVideoElement: HTMLVideoElement;
	let remoteVideoElement: HTMLVideoElement;

	let pc: RTCPeerConnection;

	let client: RtmClient;
	let channel: RtmChannel;

	const config = {
		iceServers: [
			{
				urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
			}
		]
	};

	let init = async (roomID: string) => {
		client = AgoraRTM.createInstance(APP_ID);
		let uid = String(Math.floor(Math.random() * 10000));

		await client.login({ uid });
		// Any Room ID
		channel = client.createChannel(roomID);
		await channel.join();

		channel.on('MemberJoined', handleUserJoined);
		client.on('MessageFromPeer', handleMessageFromPeer);
		channel.on('MemberLeft', handleMemberLeft);
		localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});

		if (localStream) localVideoElement.srcObject = localStream;
	};

	let handleMemberLeft = async () => {
		if (remoteStream) {
			remoteStream.getTracks().forEach((track) => {
				remoteStream?.removeTrack(track);
			});
		}
		remoteStream = null;

		if (remoteVideoElement) remoteVideoElement.style.display = 'none';
	};

	let leaveChannel = async () => {
		await stopCamera();
		await channel.leave();
		await client.logout();
	};

	onDestroy(() => {
		// Clean up the event listener when the component is destroyed
		 window.addEventListener('beforeunload', leaveChannel);
		 leaveChannel()
	});


	beforeNavigate(leaveChannel);
	

	try {
		window.addEventListener('beforeunload', leaveChannel);

	} catch (error) {
		toast.error('Before Unload Not Working', {
	position: "bottom-left"
})
	}


	// Add the event listener when the component is created

	let handleMessageFromPeer = async (message: any, MemberId: any) => {
		message = JSON.parse(message.text);
		if (message.type === 'offer') {
			createAnswer(MemberId, message.offer);
		}
		if (message.type === 'answer') {
			addAnswer(MemberId, message.answer);
		}
		if (message.type === 'candidate') {
			if (pc) {
				pc.addIceCandidate(message.candidate);
			}
		}
	};

	let endCall = async () => {
		await stopCamera();
		await handleMemberLeft();
		await leaveChannel();
		goto('/');
	};

	let stopCamera = async () => {
		if (localStream) {
			const tracks = localStream.getTracks();
			tracks.forEach((track) => {
				track.stop();
				localStream.removeTrack(track);
			});
		}
	};

	let handleUserJoined = async (MemberId: string) => {
		// console.log('A new user Joined the channel:', MemberId);
		createOffer(MemberId);
	};

	let createPeerConnection = async (MemberId: string) => {
		pc = new RTCPeerConnection(config);
		remoteStream = new MediaStream();
		if (remoteVideoElement != null) {
			remoteVideoElement.style.display = 'block';
			remoteVideoElement.srcObject = remoteStream;
		}

		if (!localStream) {
			localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true
			});
			localVideoElement.srcObject = localStream;
		}

		localStream.getTracks().forEach((track) => {
			pc.addTrack(track, localStream);
		});

		pc.ontrack = (event: any) => {
			event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
				remoteStream?.addTrack(track);
			});
		};

		pc.onicecandidate = async (event: any) => {
			if (event.candidate) {
				client.sendMessageToPeer(
					{
						text: JSON.stringify({
							type: 'candidate',
							candidate: event.candidate
						})
					},
					MemberId
				);
			}
		};
	};

	let createOffer = async (MemberId: string) => {
		await createPeerConnection(MemberId);

		let offer = await pc.createOffer();
		await pc.setLocalDescription(offer);

		client.sendMessageToPeer({ text: JSON.stringify({ type: 'offer', offer: offer }) }, MemberId);
	};

	let createAnswer = async (MemberId: string, offer: RTCSessionDescriptionInit) => {
		await createPeerConnection(MemberId);

		await pc.setRemoteDescription(offer);
		let answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);

		client.sendMessageToPeer(
			{ text: JSON.stringify({ type: 'answer', answer: answer }) },
			MemberId
		);
	};

	let addAnswer = async (MemberId: string, answer: RTCSessionDescriptionInit) => {
		if (!pc.currentRemoteDescription) {
			await pc.setRemoteDescription(answer);
		}
	};
	let roomID = $page.url.searchParams.get('roomID');

	if (roomID !== null && roomID.length > 4) {
		init(roomID);
	} else goto('/', { replaceState: true });

	let toggleVIdeo = async () => {
		let videoTrack = localStream.getTracks().find((track) => track.kind === 'video');
		if (videoTrack) {
			if (videoTrack?.enabled) {
				videoTrack.enabled = false;
				cam = false;
			} else {
				videoTrack.enabled = true;
				cam = true;
			}
		}
	};
	let toggleAudio = async () => {
		let audioTrack = localStream.getTracks().find((track) => track.kind === 'audio');

		if (audioTrack) {
			if (audioTrack.enabled) {
				audioTrack.enabled = false;
				audio = false;
			} else {
				audioTrack.enabled = true;
				audio = true;
			}
		}
	};
</script>

{#if roomID !== null && roomID.length > 4}
	<main class="w-full flex flex-col items-center screen justify-center">
		<div class={remoteStream ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'grid grid-cols-1 gap-2'}>
			<div
				class="aspect-video w-full rounded-md overflow-clip items-center flex justify-center h-56 bg-black"
			>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					bind:this={localVideoElement}
					playsinline
					autoplay
					muted
					class=" w-full h-56 object-cover"
				/>
			</div>
<Toaster/>
			<div
				class={remoteStream
					? 'aspect-video w-full rounded-md overflow-clip items-center flex justify-center h-56 bg-black'
					: 'hidden'}
			>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					playsinline
					autoplay
					bind:this={remoteVideoElement}
					class=" w-full h-56 object-cover"
				/>
			</div>
		</div>
		<div class="inline-flex items-center justify-center gap-4 mt-3">
			<button
				class={!cam
					? 'p-2 bg-red-500 text-2xl font-semibold text-white rounded-full'
					: 'p-2 bg-green-500 text-2xl font-semibold text-white rounded-full'}
				on:click|preventDefault={() => toggleVIdeo()}
			>
				{#if cam}
					<Icon icon="bx:camera" />
				{:else}
					<Icon icon="bx:camera-off" />
				{/if}
			</button>
			<button
				class={!audio
					? 'p-2 bg-red-500 text-2xl font-semibold text-white rounded-full'
					: 'p-2 bg-green-500 text-2xl font-semibold text-white rounded-full'}
				on:click|preventDefault={() => toggleAudio()}
			>
				{#if audio}
					<Icon icon="bx:microphone" />
				{:else}
					<Icon icon="bx:microphone-off" />
				{/if}
			</button>
			<button
				class={'p-2 bg-red-500 text-2xl font-semibold text-white rounded-full'}
				on:click|preventDefault={endCall}
			>
				<Icon icon="fluent:call-end-16-regular" />
			</button>
			<Share
				title={'Meeting ID'}
				text={'Share this link other person'}
				url={$page.url.toString()}
			/>
		</div>
	</main>
{:else}
	<main />
{/if}
<svelte:head>
	<title>Video Call</title>
	<meta name="description" content="FOSS: Video Calling app built using webrtc." />
</svelte:head>
