<script>
	import { goto } from '$app/navigation';

	// @ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import BiDonateHeart from 'svelte-icons-pack/bi/BiDonateHeart';

	import logo from '$lib/images/logo.svg';
	import toast, { Toaster } from 'svelte-french-toast';
</script>

<div class="flex fixed top-0 items-center justify-center text-black p-2 w-full">
	<nav
		class="flex flex-row text-3xl mx-auto font-medium px-10 py-2 items-center w-full justify-between"
	>
		<button
			class="inline-flex gap-2 items-center justify-center"
			on:click|preventDefault={() => goto('/')}
			><img alt="logo" class="aspect-square" width="40px" src={logo} />
			<h1 class=" text-xl">Video Call</h1>
		</button>
		<ul class="inline-flex items-center justify-center gap-4">
			<button
				on:click|preventDefault={() => {
					toast.dismiss();
					toast.success(`Thanks for trying to support but we don't recieve any donations`, {
						position: 'top-center'
					});
				}}
			>
				<Icon src={BiDonateHeart} />
			</button>
			<Toaster containerClassName="text-sm" />
			<!-- <li>
            <Icon src={BiHelpCircle} />
        </li> -->
		</ul>
	</nav>
</div>
