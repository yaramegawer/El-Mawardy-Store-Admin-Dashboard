const inputs = document.querySelectorAll(".input");
console.log(inputs);

function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
	console.log(parent);
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input1 => {input1.addEventListener("focus", addcl);input1.addEventListener("blur", remcl);});
